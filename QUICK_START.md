# ⚡ QUICK REFERENCE GUIDE

## 🚀 СТАРТ (30 секунд)

```bash
# Terminal 1: Database
mongod

# Terminal 2: Backend
npm run backend:dev

# Terminal 3: Frontend
npm run dev
```

**Готово!** Откроется http://localhost:5173 ✅

---

## 📚 ДОКУМЕНТАЦИЯ

| Документ | Время | Зачем? |
|----------|-------|--------|
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | 5 мин | Быстрый старт |
| [EXAMPLES.md](./EXAMPLES.md) | 10 мин | Примеры кода |
| [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) | 20 мин | Полная инструкция |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 15 мин | Как устроено |
| [CHECKLIST.md](./CHECKLIST.md) | по надобе | Проблемы + решения |

---

## 💻 ПРИМЕРЫ (Скопируй-вставь)

### Получить товары
```jsx
import { useProducts } from './hooks/useApi'

function MyComponent() {
  const { products, loading } = useProducts()
  return <div>{products.map(p => <div key={p._id}>{p.name}</div>)}</div>
}
```

### Корзина
```jsx
import { useCart } from './hooks/useApi'

function MyComponent() {
  const { cart, addToCart, getTotalPrice } = useCart()
  return <div>Товаров: {cart.length}, Сумма: ${getTotalPrice()}</div>
}
```

### Авторизация
```jsx
import { useAuth } from './hooks/useApi'

function MyComponent() {
  const { user, login, logout } = useAuth()
  return user ? <button onClick={logout}>Выход</button> : <button onClick={() => login({...})}>Вход</button>
}
```

### Заказ
```jsx
import { useOrder } from './hooks/useApi'

function MyComponent() {
  const { createOrder, loading } = useOrder()
  const handle = () => createOrder({ items: [...], total: 100 })
  return <button onClick={handle}>{loading ? 'Ожидание...' : 'Заказать'}</button>
}
```

---

## 🔌 API ENDPOINTS

```
GET    /api/products              # Товары
POST   /api/products              # Создать товар
GET    /api/products/:id          # Товар по ID

POST   /api/orders                # Создать заказ
GET    /api/orders                # Мои заказы

POST   /api/auth/login            # Вход
POST   /api/auth/register         # Регистрация
GET    /api/auth/me               # Мой профиль
```

---

## 🛠️ NPM СКРИПТЫ

```bash
npm run dev                 # Запустить фронтенд
npm run build              # Собрать для production
npm run preview            # Просмотр production сборки

npm run backend:dev        # Запустить бекенд
npm run backend:build      # Собрать бекенд
npm run backend:install    # Установить зависимости бекенда
```

---

## 📁 ФАЙЛЫ КОТОРЫЕ НУЖНЫ

### Обязательные для работы
```
✅ src/api/config.js       # API клиент
✅ src/api/services.js     # Сервисы
✅ src/hooks/useApi.js     # React хуки
✅ .env.local              # Config
✅ vite.config.js          # Vite config
✅ back_shop/              # Бекенд папка
```

### Документация (опциональные для чтения)
```
📖 SETUP_GUIDE.md
📖 EXAMPLES.md
📖 BACKEND_INTEGRATION.md
📖 ARCHITECTURE.md
📖 CHECKLIST.md
```

---

## ⚙️ КОНФИГУРАЦИЯ

### .env.local
```env
VITE_API_URL=http://localhost:3000/api
```

### back_shop/.env
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/back-shop
JWT_ACCESS_SECRET=your-secret-key
```

---

## 🐛 БЫСТРЫЕ РЕШЕНИЯ

### ❌ API не работает
```bash
# 1. Запустить бекенд
npm run backend:dev

# 2. Запустить MongoDB
mongod

# 3. Проверить в DevTools (F12) → Network
```

### ❌ CORS ошибка
```bash
# 1. Перезагрузить браузер (Ctrl+Shift+R)
# 2. Очистить кэш (Ctrl+Shift+Delete)
# 3. Проверить vite.config.js
```

### ❌ JWT токен невалидный
```javascript
// Удалить из localStorage
localStorage.removeItem('auth_token')

// Заново выполнить вход
```

### ❌ MongoDB не подключается
```bash
# Запустить MongoDB
mongod

# Или использовать облачный MongoDB Atlas
# Обновить MONGODB_URI в back_shop/.env
```

---

## 📊 СТРУКТУРА

```
Компонент React
    ↓
useProducts / useCart / useAuth Hook
    ↓
productService / orderService / etc
    ↓
apiClient.get / post / put / delete
    ↓
HTTP Request (+ JWT)
    ↓
Vite Proxy
    ↓
NestJS Backend
    ↓
MongoDB Database
```

---

## ✅ ПРОВЕРКА РАБОТЫ

```
✓ http://localhost:5173     # Фронтенд открывается
✓ http://localhost:3000     # Бекенд доступен
✓ DevTools Network tab      # Запросы идут на /api
✓ DevTools Console          # Нет красных ошибок
```

---

## 🎯 ИНТЕГРАЦИЯ В App.jsx

```jsx
// Добавить эти 3 строки в начале:
import { useProducts, useCart, useAuth } from './hooks/useApi'

// В функции App добавить:
const { products } = useProducts()
const { cart, addToCart } = useCart()
const { user } = useAuth()

// Использовать в JSX:
{products.map(p => <div>{p.name}</div>)}
```

---

## 📱 РАБОТАЕТ НА:

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile (iOS, Android)
- ✅ Tablet
- ✅ Localhost + Production

---

## 🔒 БЕЗОПАСНОСТЬ

```
✅ JWT токены
✅ Автоматическое добавление в запросы
✅ localStorage для сохранения
✅ Refresh токены (15 мин + 7 дней)
```

---

## 🎊 ВСЕ ГОТОВО!

**Версия:** 1.0.0
**Статус:** ✅ Production Ready
**Последний апдейт:** 2026-01-08

---

## 📞 ПОМОЩЬ

1. 📖 Прочитайте [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. 📋 Смотрите примеры в [EXAMPLES.md](./EXAMPLES.md)
3. 🔍 Проверьте [CHECKLIST.md](./CHECKLIST.md)
4. 🆘 Ищите решение в [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)

---

**Начните сейчас! 🚀**

```bash
npm run dev              # Фронтенд
npm run backend:dev      # Бекенд (новый терминал)
```

**http://localhost:5173** ✨
