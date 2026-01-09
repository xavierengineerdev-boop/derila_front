import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './schemas/admin.schema';
import {
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '../../common/exceptions';
import * as bcrypt from 'bcrypt';
import { TokenService } from './services/token.service';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private tokenService: TokenService,
  ) {}

  async onModuleInit() {
    await this.initializeAdmin();
  }

  /**
   * Инициализация админа при старте приложения
   */
  private async initializeAdmin() {
    const adminEmail = 'ihorhnennyi@gmail.com';
    const adminPassword = '123456789';

    const existingAdmin = await this.adminModel
      .findOne({ email: adminEmail })
      .exec();

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await this.adminModel.create({
        email: adminEmail,
        password: hashedPassword,
        isActive: true,
        role: 'admin',
      });
      console.log('✅ Админ успешно создан:', adminEmail);
    } else {
      // Обновляем пароль, если он изменился
      const isPasswordValid = await bcrypt.compare(
        adminPassword,
        existingAdmin.password,
      );
      if (!isPasswordValid) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        existingAdmin.password = hashedPassword;
        await existingAdmin.save();
        console.log('✅ Пароль админа обновлен');
      }
    }
  }

  /**
   * Поиск админа по email
   */
  async findByEmail(email: string): Promise<Admin | null> {
    return this.adminModel.findOne({ email }).exec();
  }

  /**
   * Поиск админа по ID
   */
  async findById(id: string): Promise<Admin> {
    const admin = await this.adminModel.findById(id).exec();
    if (!admin) {
      throw new NotFoundException('Admin', { id });
    }
    return admin;
  }

  /**
   * Проверка пароля
   */
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Получить информацию об админе (без пароля)
   */
  async getAdminInfo(email: string) {
    const admin = await this.findByEmail(email);
    if (!admin) {
      throw new NotFoundException('Admin');
    }

    const adminDoc = admin as AdminDocument;
    return {
      id: adminDoc._id ? adminDoc._id.toString() : null,
      email: admin.email,
      isActive: admin.isActive,
      role: admin.role,
      createdAt: (adminDoc as any).createdAt,
      updatedAt: (adminDoc as any).updatedAt,
    };
  }

  /**
   * Вход админа и генерация токенов
   */
  async login(email: string, password: string) {
    const admin = await this.findByEmail(email);

    if (!admin) {
      throw new NotFoundException('Admin');
    }

    if (!admin.isActive) {
      throw new ForbiddenException('Аккаунт админа деактивирован');
    }

    const isPasswordValid = await this.validatePassword(
      password,
      admin.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.tokenService.generateTokenPair(admin as AdminDocument);
  }

  /**
   * Обновление токенов
   */
  async refreshTokens(refreshToken: string) {
    const adminId = await this.tokenService.validateRefreshToken(refreshToken);

    if (!adminId) {
      throw new UnauthorizedException('Неверный или истекший refresh токен');
    }

    const admin = await this.findById(adminId);

    if (!admin.isActive) {
      throw new ForbiddenException('Аккаунт админа деактивирован');
    }

    // Отзываем старый токен
    await this.tokenService.revokeRefreshToken(refreshToken);

    // Генерируем новую пару токенов
    return this.tokenService.generateTokenPair(admin as AdminDocument);
  }

  /**
   * Выход (отзыв всех токенов)
   */
  async logout(adminId: string) {
    await this.tokenService.revokeAllAdminTokens(adminId);
    return { message: 'Успешный выход' };
  }
}

