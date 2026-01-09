import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Integration, IntegrationDocument, IntegrationType, IntegrationStatus } from './schemas/integration.schema';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import {
  NotFoundException,
  BadRequestException,
} from '../../common/exceptions';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectModel(Integration.name) private integrationModel: Model<IntegrationDocument>,
  ) {}

  /**
   * Создание интеграции
   */
  async create(createIntegrationDto: CreateIntegrationDto): Promise<Integration> {
    const integration = new this.integrationModel({
      ...createIntegrationDto,
      status: createIntegrationDto.status || IntegrationStatus.INACTIVE,
      isActive: createIntegrationDto.isActive !== undefined ? createIntegrationDto.isActive : true,
    });

    return integration.save();
  }

  /**
   * Получение всех интеграций
   */
  async findAll(includeInactive = false): Promise<Integration[]> {
    const query = includeInactive ? {} : { isActive: true };
    return this.integrationModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Получение интеграций по типу
   */
  async findByType(type: IntegrationType, includeInactive = false): Promise<Integration[]> {
    const query: any = { type };
    if (!includeInactive) {
      query.isActive = true;
    }
    return this.integrationModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Получение активных интеграций по типу
   */
  async findActiveByType(type: IntegrationType): Promise<Integration[]> {
    return this.integrationModel
      .find({
        type,
        isActive: true,
        status: IntegrationStatus.ACTIVE,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Получение интеграции по ID
   */
  async findOne(id: string): Promise<Integration> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid integration ID');
    }

    const integration = await this.integrationModel.findById(id).exec();

    if (!integration) {
      throw new NotFoundException('Integration', { id });
    }

    return integration;
  }

  /**
   * Обновление интеграции
   */
  async update(id: string, updateIntegrationDto: UpdateIntegrationDto): Promise<Integration> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid integration ID');
    }

    const integration = await this.integrationModel.findById(id).exec();
    if (!integration) {
      throw new NotFoundException('Integration', { id });
    }

    return this.integrationModel
      .findByIdAndUpdate(id, updateIntegrationDto, { new: true })
      .exec();
  }

  /**
   * Удаление интеграции
   */
  async remove(id: string): Promise<Integration> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid integration ID');
    }

    const integration = await this.integrationModel.findById(id).exec();
    if (!integration) {
      throw new NotFoundException('Integration', { id });
    }

    return this.integrationModel.findByIdAndDelete(id).exec();
  }

  /**
   * Активация интеграции
   */
  async activate(id: string): Promise<Integration> {
    return this.update(id, {
      isActive: true,
      status: IntegrationStatus.ACTIVE,
    });
  }

  /**
   * Деактивация интеграции
   */
  async deactivate(id: string): Promise<Integration> {
    return this.update(id, {
      isActive: false,
      status: IntegrationStatus.INACTIVE,
    });
  }

  /**
   * Получение статистики по интеграциям
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
  }> {
    const [total, active, inactive, allIntegrations] = await Promise.all([
      this.integrationModel.countDocuments().exec(),
      this.integrationModel.countDocuments({ isActive: true }).exec(),
      this.integrationModel.countDocuments({ isActive: false }).exec(),
      this.integrationModel.find().exec(),
    ]);

    const byType: Record<string, number> = {};
    allIntegrations.forEach((integration) => {
      byType[integration.type] = (byType[integration.type] || 0) + 1;
    });

    return {
      total,
      active,
      inactive,
      byType,
    };
  }
}


