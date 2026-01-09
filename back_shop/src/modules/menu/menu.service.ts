import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Menu, MenuDocument } from './schemas/menu.schema';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { SlugUtil } from '../../common/utils/slug.util';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '../../common/exceptions';

export interface MenuTreeItem {
  id: string;
  name: string;
  slug: string;
  parent: string | null;
  order: number;
  isActive: boolean;
  url: string | null;
  icon: string | null;
  description: string | null;
  type: string;
  isNewTab: boolean;
  children?: MenuTreeItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
  ) {}

  /**
   * Создание нового меню
   */
  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    // Генерируем slug если не указан
    let slug = createMenuDto.slug;
    if (!slug) {
      slug = SlugUtil.generate(createMenuDto.name);
    }

    // Проверяем уникальность slug
    const existingMenu = await this.menuModel.findOne({ slug }).exec();
    if (existingMenu) {
      throw new ConflictException(`Menu with slug "${slug}" already exists`);
    }

    // Валидация slug
    if (!SlugUtil.isValid(slug)) {
      throw new BadRequestException('Invalid slug format');
    }

    // Проверяем существование родителя
    if (createMenuDto.parent) {
      const parent = await this.menuModel.findById(createMenuDto.parent).exec();
      if (!parent) {
        throw new NotFoundException('Parent menu', { id: createMenuDto.parent });
      }
    }

    const menu = new this.menuModel({
      ...createMenuDto,
      slug,
      parent: createMenuDto.parent ? new Types.ObjectId(createMenuDto.parent) : null,
    });

    return menu.save();
  }

  /**
   * Получить все меню
   * По умолчанию возвращает только активные меню
   */
  async findAll(includeInactive: boolean = false): Promise<Menu[]> {
    const query = includeInactive ? {} : { isActive: true };
    return this.menuModel.find(query).sort({ order: 1, createdAt: 1 }).exec();
  }

  /**
   * Получить меню по ID
   */
  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuModel.findById(id).exec();
    if (!menu) {
      throw new NotFoundException('Menu', { id });
    }
    return menu;
  }

  /**
   * Получить меню по slug
   */
  async findBySlug(slug: string): Promise<Menu> {
    const menu = await this.menuModel.findOne({ slug }).exec();
    if (!menu) {
      throw new NotFoundException('Menu', { slug });
    }
    return menu;
  }

  /**
   * Обновление меню
   */
  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.menuModel.findById(id).exec();
    if (!menu) {
      throw new NotFoundException('Menu', { id });
    }

    // Если обновляется slug, проверяем уникальность
    if (updateMenuDto.slug && updateMenuDto.slug !== menu.slug) {
      const existingMenu = await this.menuModel
        .findOne({ slug: updateMenuDto.slug })
        .exec();
      if (existingMenu) {
        throw new ConflictException(`Menu with slug "${updateMenuDto.slug}" already exists`);
      }

      if (!SlugUtil.isValid(updateMenuDto.slug)) {
        throw new BadRequestException('Invalid slug format');
      }
    }

    // Если обновляется название и slug не указан, генерируем новый slug
    if (updateMenuDto.name && !updateMenuDto.slug) {
      const newSlug = SlugUtil.generate(updateMenuDto.name);
      if (newSlug !== menu.slug) {
        const existingMenu = await this.menuModel.findOne({ slug: newSlug }).exec();
        if (!existingMenu) {
          updateMenuDto.slug = newSlug;
        }
      }
    }

    // Проверяем существование родителя
    if (updateMenuDto.parent !== undefined) {
      if (updateMenuDto.parent) {
        // Проверяем, что не устанавливаем себя как родителя
        if (updateMenuDto.parent === id) {
          throw new BadRequestException('Menu cannot be its own parent');
        }

        // Проверяем, что не создаем циклическую зависимость
        const wouldCreateCycle = await this.wouldCreateCycle(id, updateMenuDto.parent);
        if (wouldCreateCycle) {
          throw new BadRequestException('Cannot create circular reference in menu hierarchy');
        }

        const parent = await this.menuModel.findById(updateMenuDto.parent).exec();
        if (!parent) {
          throw new NotFoundException('Parent menu', { id: updateMenuDto.parent });
        }
      }
    }

    // Обновляем меню
    if (updateMenuDto.parent !== undefined) {
      updateMenuDto.parent = updateMenuDto.parent
        ? new Types.ObjectId(updateMenuDto.parent) as any
        : null;
    }

    return this.menuModel
      .findByIdAndUpdate(id, updateMenuDto, { new: true })
      .exec();
  }

  /**
   * Удаление меню
   */
  async remove(id: string): Promise<Menu> {
    const menu = await this.menuModel.findById(id).exec();
    if (!menu) {
      throw new NotFoundException('Menu', { id });
    }

    // Проверяем, есть ли дочерние меню
    const children = await this.menuModel.find({ parent: id }).exec();
    if (children.length > 0) {
      throw new BadRequestException(
        'Cannot delete menu with children. Please delete or move children first.',
      );
    }

    return this.menuModel.findByIdAndDelete(id).exec();
  }

  /**
   * Получить дерево меню
   * По умолчанию возвращает только активные меню
   */
  async getTree(includeInactive: boolean = false): Promise<MenuTreeItem[]> {
    const query = includeInactive ? {} : { isActive: true };
    const menus = await this.menuModel
      .find(query)
      .sort({ order: 1, createdAt: 1 })
      .exec();

    return this.buildTree(menus);
  }

  /**
   * Построение дерева из плоского списка
   */
  private buildTree(menus: MenuDocument[]): MenuTreeItem[] {
    const menuMap = new Map<string, MenuTreeItem>();
    const rootMenus: MenuTreeItem[] = [];

    // Создаем карту всех меню
    menus.forEach((menu) => {
      const menuItem: MenuTreeItem = {
        id: (menu as any)._id.toString(),
        name: menu.name,
        slug: menu.slug,
        parent: menu.parent ? menu.parent.toString() : null,
        order: menu.order,
        isActive: menu.isActive,
        url: menu.url,
        icon: menu.icon,
        description: menu.description,
        type: menu.type,
        isNewTab: menu.isNewTab,
        children: [],
        createdAt: (menu as any).createdAt,
        updatedAt: (menu as any).updatedAt,
      };
      menuMap.set(menuItem.id, menuItem);
    });

    // Строим дерево
    menus.forEach((menu) => {
      const menuItem = menuMap.get((menu as any)._id.toString());
      if (menu.parent) {
        const parent = menuMap.get(menu.parent.toString());
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(menuItem);
        }
      } else {
        rootMenus.push(menuItem);
      }
    });

    // Сортируем детей по order
    const sortChildren = (items: MenuTreeItem[]) => {
      items.sort((a, b) => a.order - b.order);
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          sortChildren(item.children);
        }
      });
    };

    sortChildren(rootMenus);

    return rootMenus;
  }

  /**
   * Проверка на создание циклической зависимости
   */
  private async wouldCreateCycle(menuId: string, newParentId: string): Promise<boolean> {
    let currentParentId = newParentId;

    while (currentParentId) {
      if (currentParentId === menuId) {
        return true;
      }

      const parent = await this.menuModel.findById(currentParentId).exec();
      if (!parent || !parent.parent) {
        break;
      }

      currentParentId = parent.parent.toString();
    }

    return false;
  }
}

