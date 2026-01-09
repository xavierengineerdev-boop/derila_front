# Быстрая настройка Telegram для заказов

## Твои данные
- **Chat ID**: 8498978105
- **Bot Token**: 8491819509:AAERt0zFVLwoXh9lj1vqEjV3W7q2GEjw0Ig

## Вариант 1: Через API (если есть JWT токен админа)

```bash
curl -X POST http://localhost:3000/api/integrations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "type": "telegram",
    "name": "Основной Telegram бот для заказов",
    "description": "Отправка уведомлений о новых заказах",
    "status": "active",
    "botToken": "8491819509:AAERt0zFVLwoXh9lj1vqEjV3W7q2GEjw0Ig",
    "chatId": "8498978105",
    "settings": {}
  }'
```

## Вариант 2: Через MongoDB Compass или mongosh

```javascript
db.integrations.insertOne({
  type: "telegram",
  name: "Основной Telegram бот для заказов",
  description: "Отправка уведомлений о новых заказах",
  status: "active",
  botToken: "8491819509:AAERt0zFVLwoXh9lj1vqEjV3W7q2GEjw0Ig",
  chatId: "8498978105",
  settings: {},
  credentials: {},
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Вариант 3: Админ панель (если есть UI)

1. Перейди в раздел "Интеграции"
2. Нажми "Создать новую интеграцию"
3. Заполни форму:
   - **Тип**: Telegram
   - **Название**: Основной Telegram бот для заказов
   - **Bot Token**: 8491819509:AAERt0zFVLwoXh9lj1vqEjV3W7q2GEjw0Ig
   - **Chat ID**: 8498978105
   - **Статус**: Active
4. Сохрани

## Проверка

После сохранения создай тестовый заказ:
1. Открой фронт
2. Заполни форму заказа
3. Отправь заказ
4. Проверь что сообщение пришло в Telegram на @SalieriDev

## Для группы (опционально)

Если нужна копия в группе:

1. Создай группу в Telegram
2. Добавь бота в группу
3. Отправь сообщение в группу
4. Получи ID группы через API:
   ```
   https://api.telegram.org/bot8491819509:AAERt0zFVLwoXh9lj1vqEjV3W7q2GEjw0Ig/getUpdates
   ```
5. Найди `"chat":{"id":-1001234567890` (ID группы всегда со знаком минус)

6. Обнови интеграцию добавив ID группы в settings:
   ```json
   {
     "groupId": "-1001234567890"
   }
   ```

Тогда при каждом заказе будет отправляться уведомление и в личный чат, и в группу.
