// ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ API В РАЗНЫХ СЦЕНАРИЯХ

// ============================================
// 1️⃣ ПОЛУЧИТЬ И ОТОБРАЗИТЬ СПИСОК ТОВАРОВ
// ============================================

import { useProducts } from './hooks/useApi'

function ProductShowcase() {
  const { products, loading, error, fetchProducts } = useProducts()

  return (
    <div>
      <button onClick={() => fetchProducts('pillow')}>Поиск подушек</button>
      
      {loading && <p>⏳ Загрузка товаров...</p>}
      {error && <p style={{ color: 'red' }}>❌ Ошибка: {error}</p>}
      
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {products.map(product => (
            <div key={product._id} style={{ 
              border: '1px solid #ddd', 
              padding: '20px', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <img src={product.image || '/Pod-1.svg'} alt={product.name} style={{ width: '100%' }} />
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p style={{ fontSize: '24px', color: '#008F51', fontWeight: 'bold' }}>
                ${product.price}
              </p>
              <button style={{
                padding: '10px 20px',
                background: '#008F51',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}>
                Добавить в корзину
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// 2️⃣ КОРЗИНА С ПОЛНЫМ ФУНКЦИОНАЛОМ
// ============================================

import { useCart } from './hooks/useApi'

function ShoppingCart() {
  const { 
    cart, 
    addToCart, 
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems 
  } = useCart()

  if (cart.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Ваша корзина пуста 🛒</div>
  }

  return (
    <div style={{ padding: '40px' }}>
      <h2>Корзина ({getTotalItems()} товаров)</h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ textAlign: 'left', padding: '10px' }}>Товар</th>
            <th style={{ textAlign: 'center', padding: '10px' }}>Цена</th>
            <th style={{ textAlign: 'center', padding: '10px' }}>Кол-во</th>
            <th style={{ textAlign: 'center', padding: '10px' }}>Сумма</th>
            <th style={{ textAlign: 'center', padding: '10px' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {cart.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{item.name}</td>
              <td style={{ textAlign: 'center', padding: '10px' }}>${item.price}</td>
              <td style={{ textAlign: 'center', padding: '10px' }}>
                <input 
                  type="number" 
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  style={{ width: '50px', padding: '5px' }}
                />
              </td>
              <td style={{ textAlign: 'center', padding: '10px', fontWeight: 'bold' }}>
                ${(item.price * item.quantity).toFixed(2)}
              </td>
              <td style={{ textAlign: 'center', padding: '10px' }}>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    padding: '5px 10px',
                    background: '#E11D20',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <h3>Итого: ${getTotalPrice().toFixed(2)}</h3>
        <button 
          onClick={clearCart}
          style={{
            padding: '10px 20px',
            background: '#ddd',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Очистить корзину
        </button>
        <button 
          style={{
            padding: '10px 20px',
            background: '#008F51',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Оформить заказ
        </button>
      </div>
    </div>
  )
}

// ============================================
// 3️⃣ АВТОРИЗАЦИЯ И ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
// ============================================

import { useAuth } from './hooks/useApi'
import { useState } from 'react'

function AuthPanel() {
  const { user, loading, error, login, logout, register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isLogin) {
        await login({ email, password })
      } else {
        await register({ email, password, name: email.split('@')[0] })
      }
      setEmail('')
      setPassword('')
    } catch (err) {
      console.error('Auth error:', err)
    }
  }

  if (loading) {
    return <p>⏳ Проверка авторизации...</p>
  }

  if (user) {
    return (
      <div style={{
        padding: '20px',
        background: '#E1F1FE',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>👤 {user.name || user.email}</h3>
            <p>Email: {user.email}</p>
            <p>Дата регистрации: {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <button 
            onClick={logout}
            style={{
              padding: '10px 20px',
              background: '#E11D20',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Выход
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '0 auto', 
      padding: '20px', 
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginTop: '5px',
              boxSizing: 'border-box'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Пароль:</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginTop: '5px',
              boxSizing: 'border-box'
            }}
            required
          />
        </div>

        {error && <p style={{ color: 'red', marginBottom: '15px' }}>❌ {error}</p>}

        <button 
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            background: '#008F51',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          {isLogin ? 'Вход' : 'Регистрация'}
        </button>

        <button 
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#ddd',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isLogin ? 'Еще нет аккаунта?' : 'Уже есть аккаунт?'}
        </button>
      </form>
    </div>
  )
}

// ============================================
// 4️⃣ ОФОРМЛЕНИЕ ЗАКАЗА
// ============================================

import { useOrder } from './hooks/useApi'

function CheckoutForm() {
  const { createOrder, loading, error } = useOrder()
  const { cart, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()

  const handleCheckout = async () => {
    if (!user) {
      alert('Пожалуйста, авторизуйтесь перед заказом')
      return
    }

    try {
      const order = await createOrder({
        items: cart,
        total: getTotalPrice(),
        customer: {
          name: user.name || user.email,
          email: user.email,
          phone: '+1 (555) 000-0000'
        }
      })

      console.log('✅ Заказ создан:', order)
      clearCart()
      alert(`Спасибо за заказ!\nНомер заказа: ${order._id}`)
    } catch (err) {
      alert(`❌ Ошибка: ${err.message}`)
    }
  }

  return (
    <div style={{ padding: '40px', background: '#E1F1FE', borderRadius: '8px' }}>
      <h2>📦 Оформление заказа</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Товары в заказе:</h3>
        {cart.map(item => (
          <p key={item.id}>
            {item.name} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
          </p>
        ))}
        <h3>Итого: ${getTotalPrice().toFixed(2)}</h3>
      </div>

      {error && <p style={{ color: 'red' }}>❌ {error}</p>}

      <button 
        onClick={handleCheckout}
        disabled={loading || cart.length === 0}
        style={{
          padding: '15px 30px',
          background: loading ? '#ccc' : '#008F51',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        {loading ? '⏳ Обработка...' : '✅ Подтвердить заказ'}
      </button>
    </div>
  )
}

// ============================================
// 5️⃣ ПОЛНАЯ СТРАНИЦА (App.jsx)
// ============================================

import { useState } from 'react'
import { useProducts, useCart, useAuth } from './hooks/useApi'

function App() {
  const [view, setView] = useState('products') // products, cart, profile

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header с навигацией */}
      <header style={{
        background: 'white',
        padding: '20px 40px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1>🛍️ Мой магазин</h1>
        <nav style={{ display: 'flex', gap: '20px' }}>
          <button 
            onClick={() => setView('products')}
            style={{ background: view === 'products' ? '#008F51' : '#ddd', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Товары
          </button>
          <button 
            onClick={() => setView('cart')}
            style={{ background: view === 'cart' ? '#008F51' : '#ddd', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Корзина 🛒
          </button>
          <button 
            onClick={() => setView('profile')}
            style={{ background: view === 'profile' ? '#008F51' : '#ddd', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Профиль 👤
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px' }}>
        {view === 'products' && <ProductShowcase />}
        {view === 'cart' && <ShoppingCart />}
        {view === 'profile' && <AuthPanel />}
      </main>

      {/* Footer */}
      <footer style={{ 
        background: '#333', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        marginTop: '40px'
      }}>
        <p>© 2026 Мой магазин. Все права защищены.</p>
      </footer>
    </div>
  )
}

export default App

// ============================================
// КОНЕЦ ПРИМЕРОВ
// ============================================
