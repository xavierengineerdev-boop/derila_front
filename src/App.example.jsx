// Пример интеграции бекенда в App.jsx
// Добавьте это в начало файла App.jsx:

import { useState, useEffect } from 'react'
import { useProducts, useCart, useAuth, useOrder } from './hooks/useApi'
import './App.css'

function App() {
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440)
  const [expandedFAQ, setExpandedFAQ] = useState(null)
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  
  // API Hooks
  const { products, loading: productsLoading } = useProducts()
  const { cart, addToCart, removeFromCart, getTotalPrice, getTotalItems, clearCart } = useCart()
  const { user, login, logout } = useAuth()
  const { createOrder, loading: orderLoading } = useOrder()

  // Существующий код для resize listener
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // FAQ items (оставить как есть)
  const faqItems = [
    {
      id: 1,
      question: 'Ile trwa przyzwyczajenie?',
      answer: 'Większość użytkowników przyzwyczaja się do nowej poduszki w ciągu 1-2 tygodni. Organizm potrzebuje czasu, aby dostosować się do nowego wsparcia ortopedycznego.'
    },
    {
      id: 2,
      question: 'Jakie są warunki zwrotu?',
      answer: 'Oferujemy 100-dniowy okres zwrotu. Jeśli nie jesteś zadowolony z produktu, możesz go zwrócić w ciągu 100 dni od zakupu, aby otrzymać pełny zwrot.'
    },
    {
      id: 3,
      question: 'Czy można prać poduszkę w pralce?',
      answer: 'Poszewkę można prać w pralce w temperaturze do 30°C. Piankę należy czyścić tylko miejscowo, delikatnie wodą i łagodnym mydłem.'
    },
    {
      id: 4,
      question: 'Czy pasuje do standardowych poszewek?',
      answer: 'Tak, poduszka Derila Ergo pasuje do standardowych poszewek na poduszki. Wymiary poduszki to 54x36 cm (Standard), 60x41 cm (Duża) lub 74x46 cm (Bardzo duża).'
    }
  ]

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  // Обработчик добавления в корзину
  const handleAddToCart = (product, quantity = 1) => {
    addToCart({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/Pod-1.svg',
      quantity: quantity
    })
    alert(`${product.name} добавлен в корзину!`)
  }

  // Обработчик оформления заказа
  const handleCheckout = async () => {
    if (!user) {
      alert('Пожалуйста, войдите в систему')
      return
    }

    if (cart.length === 0) {
      alert('Корзина пуста')
      return
    }

    try {
      const order = await createOrder({
        items: cart,
        total: getTotalPrice(),
        customer: {
          name: user.name || user.email,
          email: user.email,
          phone: user.phone || '+1234567890'
        }
      })

      alert('Заказ успешно создан!')
      clearCart()
      setShowCheckout(false)
      setShowCart(false)
      console.log('Order created:', order)
    } catch (error) {
      alert('Ошибка при создании заказа: ' + error.message)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <img 
          src="/logo.png"
          alt="Logo"
          className="logo"
        />
        <nav className="nav">
          <a href="#" className="nav-link">О товаре</a>
          <a href="#" className="nav-link">Отзывы</a>
          <a href="#" className="nav-link">FAQ</a>
          <a href="#" className="nav-link">Контакты</a>
        </nav>
        
        {/* Кнопка корзины и профиля */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowCart(!showCart)}
            style={{
              padding: '8px 16px',
              background: '#008F51',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🛒 Корзина ({getTotalItems()})
          </button>
          
          {user ? (
            <button 
              onClick={logout}
              style={{
                padding: '8px 16px',
                background: '#E11D20',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Выход ({user.email})
            </button>
          ) : (
            <button 
              onClick={() => login({ email: 'test@example.com', password: 'password' })}
              style={{
                padding: '8px 16px',
                background: '#008F51',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Вход
            </button>
          )}
        </div>
      </header>

      {/* Модал корзины */}
      {showCart && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '400px',
          height: '100vh',
          background: 'white',
          boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <h2>Корзина</h2>
          {cart.length === 0 ? (
            <p>Корзина пуста</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #ddd'
                }}>
                  <div>
                    <p>{item.name}</p>
                    <p>${item.price} x {item.quantity}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      padding: '4px 8px',
                      background: '#E11D20',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <h3>Итого: ${getTotalPrice().toFixed(2)}</h3>
              <button 
                onClick={() => setShowCheckout(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#008F51',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                {orderLoading ? 'Обработка...' : 'Оформить заказ'}
              </button>
            </>
          )}
          <button 
            onClick={() => setShowCart(false)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#ddd',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Закрыть
          </button>
        </div>
      )}

      {/* Основной контент - добавьте свой существующий JSX здесь */}
      {/* ... ваш существующий код для hero, features, reviews и т.д. ... */}

      {/* Пример отображения товаров из API */}
      {productsLoading && <div style={{ padding: '20px' }}>Загрузка товаров...</div>}
      
      {!productsLoading && products.length > 0 && (
        <section style={{ padding: '40px' }}>
          <h2>Доступные товары</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {products.map(product => (
              <div key={product._id} style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#008F51' }}>
                  ${product.price}
                </p>
                <button 
                  onClick={() => handleAddToCart(product)}
                  style={{
                    padding: '10px 20px',
                    background: '#008F51',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Добавить в корзину
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Оставьте весь остальной существующий JSX вашего App.jsx ... */}
    </div>
  )
}

export default App
