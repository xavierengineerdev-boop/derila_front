import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IntegrationDocument = Integration & Document;

/**
 * Типы интеграций
 */
export enum IntegrationType {
  FACEBOOK = 'facebook',
  TELEGRAM = 'telegram',
  INSTAGRAM = 'instagram',
  WHATSAPP = 'whatsapp',
  VIBER = 'viber',
  EMAIL = 'email',
  SMS = 'sms',
  CUSTOM = 'custom', // Для кастомных интеграций
}

/**
 * Статус интеграции
 */
export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

/**
 * Схема интеграции
 */
@Schema({ timestamps: true })
export class Integration {
  @Prop({ type: String, enum: IntegrationType, required: true, index: true })
  type: IntegrationType; // Тип интеграции

  @Prop({ type: String, required: true })
  name: string; // Название интеграции (например: "Основной Telegram бот")

  @Prop({ type: String, default: null })
  description?: string; // Описание

  @Prop({ type: String, enum: IntegrationStatus, default: IntegrationStatus.INACTIVE, index: true })
  status: IntegrationStatus; // Статус интеграции

  // Токены и ключи (хранятся в зашифрованном виде или как есть, в зависимости от требований)
  @Prop({ type: String, default: null })
  token?: string; // Основной токен/ключ

  @Prop({ type: String, default: null })
  apiKey?: string; // API ключ

  @Prop({ type: String, default: null })
  apiSecret?: string; // API секрет

  @Prop({ type: String, default: null })
  accessToken?: string; // Access токен

  @Prop({ type: String, default: null })
  refreshToken?: string; // Refresh токен

  @Prop({ type: String, default: null })
  code?: string; // OAuth код (временный, для обмена на токен)

  // Для Telegram
  @Prop({ type: String, default: null })
  botToken?: string; // Токен Telegram бота

  @Prop({ type: String, default: null })
  chatId?: string; // ID чата/группы Telegram

  @Prop({ type: String, default: null })
  groupCode?: string; // Код группы Telegram

  // Для Facebook
  @Prop({ type: String, default: null })
  pageId?: string; // ID страницы Facebook

  @Prop({ type: String, default: null })
  appId?: string; // ID приложения Facebook

  // Для Keitaro
  @Prop({ type: String, default: null })
  trackingScript?: string; // Keitaro tracking script
  @Prop({ type: String, default: null })
  trackingUrl?: string; // Keitaro tracking URL (R_PATH)
  @Prop({ type: String, default: null })
  postbackUrl?: string; // Keitaro postback URL (P_PATH)

  // Дополнительные настройки (гибкое хранилище)
  @Prop({ type: Object, default: {} })
  settings: Record<string, any>; // Дополнительные настройки

  @Prop({ type: Object, default: {} })
  credentials: Record<string, any>; // Дополнительные учетные данные

  // Метаданные
  @Prop({ type: Date, default: null })
  tokenExpiresAt?: Date; // Срок действия токена

  @Prop({ type: String, default: null })
  lastError?: string; // Последняя ошибка

  @Prop({ type: Date, default: null })
  lastErrorAt?: Date; // Время последней ошибки

  @Prop({ type: Boolean, default: true })
  isActive: boolean; // Активна ли интеграция

  @Prop({ type: Number, default: 0 })
  usageCount: number; // Счетчик использования

  @Prop({ type: Date, default: null })
  lastUsedAt?: Date; // Время последнего использования
}

export const IntegrationSchema = SchemaFactory.createForClass(Integration);

// Индексы
IntegrationSchema.index({ type: 1, isActive: 1 });
IntegrationSchema.index({ status: 1 });

