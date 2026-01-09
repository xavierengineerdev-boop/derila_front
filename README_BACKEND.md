# 🏪 Полнофункциональный E-Commerce сайт с бекендом

## 📦 Проект полностью подключен и готов к работе!

### Структура проекта:
```
Fff/
├── 📁 src/                          # Фронтенд (React + Vite)
│   ├── 📁 api/
│   │   ├── config.js               # ✨ API конфигурация
│   │   └── services.js             # ✨ Все API сервисы
│   ├── 📁 hooks/
│   │   └── useApi.js               # ✨ React хуки для API
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── 📁 back_shop/                    # Бекенд (NestJS + MongoDB)
│   ├── 📁 src/
│   ├── .env                         # ✅ Конфигурирован
│   ├── package.json
│   └── ...
│
├── .env.local                       # ✨ Переменные фронтенда
├── vite.config.js                  # ✅ С поддержкой API прокси
├── package.json
├── index.html
│
├── 📄 SETUP_GUIDE.md               # 📖 Быстрый старт
├── 📄 BACKEND_INTEGRATION.md       # 📖 Полная документация
└── README.md                        # 📖 Этот файл
```

---

## 🚀 БЫСТРЫЙ СТАРТ (5 минут)

### Шаг 1: Подготовка
```bash
# Установить зависимости фронтенда
npm install

# Установить зависимости бекенда
npm run backend:install
```

### Шаг 2: Запуск (в разных терминалах)

**Терминал 1 - MongoDB** (если используется локально):
```bash
mongod
```

**Терминал 2 - Бекенд**:
```bash
npm run backend:dev
```
Бекенд будет на: `http://localhost:3000`

**Терминал 3 - Фронтенд**:
```bash
npm run dev
```
Фронтенд будет на: `http://localhost:5173`

### ✅ Готово!
Сайт автоматически подключится к бекенду через прокси.

---

## 🎯 Что уже реализовано:

### ✨ Фронтенд
- ✅ Современный дизайн (React + Vite)
- ✅ Полная адаптивность
- ✅ Красивые CSS стили

### ✨ API Интеграция
- ✅ API клиент с автоматической обработкой JWT
- ✅ Все запросы через прокси Vite
- ✅ Обработка ошибок и загрузки

### ✨ Функционал
- ✅ Управление товарами
- ✅ Корзина (localStorage)
- ✅ Авторизация пользователей
- ✅ Создание заказов
- ✅ JWT токены

### ✨ Бекенд (NestJS)
- ✅ MongoDB интеграция
- ✅ Endpoints для товаров, заказов, авторизации
- ✅ JWT аутентификация
- ✅ CORS настроен
- ✅ Swagger документация

---

## 📚 Примеры использования в компонентах

### 1️⃣ Получить товары из базы
```jsx
import { useProducts } from './hooks/useApi'

function ProductList() {
  const { products, loading, error } = useProducts()

  if (loading) return <p>Загрузка товаров...</p>
  if (error) return <p>Ошибка: {error}</p>

  return (
    <div>
      {products.map(product => (
        <div key={product._id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <p>{product.description}</p>
        </div>
      ))}
    </div>
  )
}
```

### 2️⃣ Работа с корзиной
```jsx
import { useCart } from './hooks/useApi'

function ShoppingCart() {
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice,
    getTotalItems 
  } = useCart()

  return (
    <div>
      <h2>Корзина ({getTotalItems()} товаров)</h2>
      
      {cart.map(item => (
        <div key={item.id}>
          <p>{item.name} - ${item.price}</p>
          <input 
            type="number" 
            value={item.quantity}
            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
          />
          <button onClick={() => removeFromCart(item.id)}>Удалить</button>
        </div>
      ))}
      
      <h3>Итого: ${getTotalPrice()}</h3>
      <button onClick={() => addToCart(product)}>Добавить товар</button>
    </div>
  )
}
```

### 3️⃣ Авторизация пользователя
```jsx
import { useAuth } from './hooks/useApi'

function AuthComponent() {
  const { user, loading, error, login, logout, register } = useAuth()

  if (loading) return <p>Проверка авторизации...</p>

  if (user) {
    return (
      <div>
        <p>Добро пожаловать, {user.email}!</p>
        <button onClick={logout}>Выход</button>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => login({ 
        email: 'user@example.com', 
        password: 'password' 
      })}>
        Вход
      </button>
      {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}
    </div>
  )
}
```

### 4️⃣ Создание заказа
```jsx
import { useOrder } from './hooks/useApi'
import { useCart } from './hooks/useApi'
import { useAuth } from './hooks/useApi'

function Checkout() {
  const { user } = useAuth()
  const { cart, getTotalPrice, clearCart } = useCart()
  const { loading, error, createOrder } = useOrder()

  const handleCheckout = async () => {
    if (!user) {
      alert('Пожалуйста, войдите в систему')
      return
    }

    try {
      const order = await createOrder({
        items: cart,
        total: getTotalPrice(),
        customer: {
          name: user.name || user.email,
          email: user.email,
          phone: '+1234567890'
        }
      })

      console.log('Заказ создан:', order)
      clearCart()
      alert('Спасибо за заказ!')
    } catch (err) {
      alert('Ошибка: ' + err.message)
    }
  }

  return (
    <button 
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? 'Обработка...' : 'Оформить заказ'}
    </button>
  )
}
```

---

## 🔌 API Endpoints

### 📦 Товары
```
GET    /api/products           # Получить все товары
GET    /api/products?search=   # Поиск товаров
GET    /api/products/:id       # Получить товар по ID
POST   /api/products           # Создать товар (требует авторизацию)
PUT    /api/products/:id       # Обновить товар (требует авторизацию)
DELETE /api/products/:id       # Удалить товар (требует авторизацию)
```

### 📋 Заказы
```
POST   /api/orders             # Создать заказ
GET    /api/orders             # Получить заказы текущего пользователя
GET    /api/orders/:id         # Получить заказ по ID
```

### 👤 Авторизация
```
POST   /api/auth/register      # Регистрация
POST   /api/auth/login         # Вход
GET    /api/auth/me            # Получить текущего пользователя
POST   /api/auth/refresh       # Обновить токен
```

---

## 🛠️ Структура файлов API

### `src/api/config.js` - Конфигурация API
```javascript
export const API_BASE_URL = 'http://localhost:3000/api'
export const apiClient = { /* методы */ }
```

### `src/api/services.js` - Сервисы
```javascript
export const productService = { /* методы */ }
export const orderService = { /* методы */ }
export const authService = { /* методы */ }
export const cartService = { /* методы */ }
```

### `src/hooks/useApi.js` - React хуки
```javascript
export function useProducts() { /* ... */ }
export function useCart() { /* ... */ }
export function useAuth() { /* ... */ }
export function useOrder() { /* ... */ }
```

---

## 📋 Переменные окружения

### `.env.local` (Фронтенд)
```env
VITE_API_URL=http://localhost:3000/api
```

### `back_shop/.env` (Бекенд)
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/back-shop
JWT_ACCESS_SECRET=your-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
```

---

## 🚀 Развертывание на production

### Для фронтенда:
```bash
npm run build
# Загрузить содержимое dist/ на хостинг
```

### Для бекенда:
```bash
cd back_shop
npm run build
npm start
```

Не забудьте обновить `VITE_API_URL` на URL вашего бекенда в production!

---

## ⚠️ Troubleshooting

### ❌ "Cannot connect to API"
- Убедитесь, что бекенд запущен на `http://localhost:3000`
- Проверьте MongoDB подключение
- Откройте DevTools в браузере (F12) → Network

### ❌ "CORS Error"
- Бекенд должен иметь CORS включен
- Проверьте `main.ts` в back_shop

### ❌ "MongoDB connection failed"
- Убедитесь, что `mongod` запущен
- Или используйте MongoDB Atlas (облачный сервис)

### ❌ "Invalid token"
- Попробуйте выйти и войти заново
- Проверьте, сохранен ли токен в localStorage

---

## 📖 Дополнительные ресурсы

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Быстрый старт
- [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Полная документация
- [NestJS Docs](https://docs.nestjs.com/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)

---

## ✨ Что дальше?

1. **Добавьте авторизацию в UI** - обновите App.jsx
2. **Создайте страницы** - товары, корзина, профиль, заказы
3. **Подключите платежи** - Stripe, PayPal
4. **Настройте email уведомления** - письма при заказе
5. **Добавьте админ панель** - управление товарами

---

## 📞 Поддержка

Если возникли проблемы или вопросы:
1. Прочитайте документацию в этой папке
2. Проверьте консоль браузера (F12)
3. Проверьте логи бекенда
4. Убедитесь, что все процессы запущены

---

## 📄 Лицензия

MIT

---

**Готово! 🎉 Ваш E-Commerce сайт полностью функционален!**

Начните работу:
```bash
npm run dev          # Запустить фронтенд
npm run backend:dev  # Запустить бекенд (в другом терминале)
```

Приложение будет доступно на `http://localhost:5173` ✨
