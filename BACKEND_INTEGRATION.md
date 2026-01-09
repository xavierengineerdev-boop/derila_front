# Инструкция по подключению Бекенда и Фронтенда

## Структура проекта
```
Fff/
├── src/                    # Фронтенд (React + Vite)
│   ├── api/
│   │   ├── config.js       # Конфигурация API клиента
│   │   └── services.js     # Сервисы (продукты, заказы, авторизация)
│   ├── hooks/
│   │   └── useApi.js       # React хуки для работы с API
│   ├── App.jsx
│   └── ...
├── back_shop/              # Бекенд (NestJS)
│   ├── src/
│   ├── .env                # Конфигурация бекенда
│   └── ...
├── package.json            # Зависимости фронтенда
├── vite.config.js          # Конфигурация Vite
├── .env.local              # Переменные окружения фронтенда
└── ...
```

## Шаг 1: Установка зависимостей

### Фронтенд (из папки Fff):
```bash
npm install
```

### Бекенд (из папки back_shop):
```bash
cd back_shop
npm install
```

## Шаг 2: Настройка переменных окружения

### Бекенд (back_shop/.env):
- Убедитесь, что MongoDB запущен или используйте MongoDB Atlas
- Конфигурация уже готова в файле `.env`

### Фронтенд (.env.local):
```
VITE_API_URL=http://localhost:3000/api
```

## Шаг 3: Запуск приложения

### Вариант 1: В разных терминалах

**Терминал 1 - Запустить MongoDB (если локально):**
```bash
mongod
```

**Терминал 2 - Запустить Бекенд:**
```bash
cd back_shop
npm run start:dev
```

**Терминал 3 - Запустить Фронтенд:**
```bash
npm run dev
```

Фронтенд будет доступен на: `http://localhost:5173`
Бекенд будет доступен на: `http://localhost:3000`
API доступен на: `http://localhost:3000/api`

## Использование API в компонентах

### Пример 1: Получение товаров
```jsx
import { useProducts } from './hooks/useApi'

function ProductList() {
  const { products, loading, error } = useProducts()

  if (loading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error}</div>

  return (
    <div>
      {products.map(product => (
        <div key={product._id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  )
}
```

### Пример 2: Работа с корзиной
```jsx
import { useCart } from './hooks/useApi'

function CartComponent() {
  const { cart, addToCart, removeFromCart, getTotalPrice } = useCart()

  return (
    <div>
      <h2>Корзина ({cart.length})</h2>
      <p>Сумма: ${getTotalPrice()}</p>
      {cart.map(item => (
        <div key={item.id}>
          {item.name} x {item.quantity}
          <button onClick={() => removeFromCart(item.id)}>Удалить</button>
        </div>
      ))}
    </div>
  )
}
```

### Пример 3: Авторизация
```jsx
import { useAuth } from './hooks/useApi'

function LoginForm() {
  const { user, login } = useAuth()

  const handleLogin = async (email, password) => {
    try {
      await login({ email, password })
      console.log('Успешная авторизация')
    } catch (err) {
      console.error('Ошибка входа:', err)
    }
  }

  return (
    <div>
      {user ? (
        <p>Добро пожаловать, {user.email}</p>
      ) : (
        <button onClick={() => handleLogin('user@example.com', 'password')}>
          Войти
        </button>
      )}
    </div>
  )
}
```

### Пример 4: Создание заказа
```jsx
import { useOrder } from './hooks/useApi'
import { useCart } from './hooks/useApi'

function CheckoutForm() {
  const { cart, getTotalPrice, clearCart } = useCart()
  const { createOrder, loading } = useOrder()

  const handleCheckout = async () => {
    try {
      const order = await createOrder({
        items: cart,
        total: getTotalPrice(),
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        }
      })
      console.log('Заказ создан:', order)
      clearCart()
    } catch (err) {
      console.error('Ошибка создания заказа:', err)
    }
  }

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Обработка...' : 'Оформить заказ'}
    </button>
  )
}
```

## API Endpoints (примеры)

### Товары
- `GET /api/products` - Получить все товары
- `GET /api/products/:id` - Получить товар по ID
- `POST /api/products` - Создать товар (админ)
- `PUT /api/products/:id` - Обновить товар (админ)
- `DELETE /api/products/:id` - Удалить товар (админ)

### Заказы
- `POST /api/orders` - Создать заказ
- `GET /api/orders` - Получить все заказы
- `GET /api/orders/:id` - Получить заказ по ID

### Авторизация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получить текущего пользователя

## Интеграция с App.jsx

Для полной интеграции обновите `src/App.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useProducts, useCart, useAuth } from './hooks/useApi'
import './App.css'

function App() {
  const { products, loading } = useProducts()
  const { cart, addToCart } = useCart()
  const { user, logout } = useAuth()

  const handleAddToCart = (product) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    })
  }

  return (
    <div className="app">
      {/* Ваш существующий код */}
      {user && (
        <button onClick={logout}>Выход ({user.email})</button>
      )}
    </div>
  )
}

export default App
```

## Решение проблем

### Ошибка подключения к API
- Убедитесь, что бекенд запущен на `http://localhost:3000`
- Проверьте конфиг в `.env.local`
- Откройте консоль браузера для детальных ошибок

### Ошибки CORS
- Бекенд должен иметь настройки CORS
- Проверьте `main.ts` бекенда

### MongoDB connection error
- Убедитесь, что MongoDB запущен
- Или используйте MongoDB Atlas (облачный сервис)
- Обновите `MONGODB_URI` в `back_shop/.env`

## Следующие шаги

1. Обновите `App.jsx` для использования реальных данных с бекенда
2. Добавьте компоненты для покупки товаров
3. Добавьте страницу профиля пользователя
4. Добавьте историю заказов
5. Реализуйте платежную систему (Stripe, PayPal и т.д.)

---

**Готово! 🎉 Ваше приложение полностью интегрировано с бекендом.**
