import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440)
  const [expandedFAQ, setExpandedFAQ] = useState(null)
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)
  const [orderData, setOrderData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+',
    address: '',
    building: '',
    apartment: '',
    city: '',
    country: 'Poland',
    zipCode: '',
    notes: '',
    quantity: 1,
    paymentMethod: 'bank_transfer',
    deliveryMethod: 'courier'
  })

  // Загружаем товары из API
  useEffect(() => {
    const fetchProducts = async () => {
      const urls = [
        'http://localhost:3001/api/products',
        'http://localhost:3000/api/products',
        '/api/products'
      ];

      let result = null;
      for (const url of urls) {
        try {
          const resp = await fetch(url, { cache: 'no-store' });
          if (!resp.ok) continue;
          result = await resp.json();
          if (result && result.data && Array.isArray(result.data)) {
                setProducts(result.data);
                // Prefer sensory panel (frontend product) -> PILLOW-001, or name contains sensory/Sinnesp
                const preferred = result.data.find(p => p.sku === 'PILLOW-001' || /derila/i.test(p.name))
                  || result.data.find(p => p.sku === 'PILLOW-001' || /derila/i.test(p.name))
                  || result.data[0];
                setSelectedProduct(preferred);
                break;
          }
        } catch (e) {
          // try next URL
          continue;
        }
      }

      if (!result) {
        setError('Failed to load products from backend (tried ports 3001 and 3000).');
      }

      setLoading(false);
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  const handleQuantityChange = (value) => {
    const newQty = parseInt(value) || 1
    if (newQty > 0) {
      setQuantity(newQty)
    }
  }

  const handleQuantityIncrease = () => {
    setQuantity(quantity + 1)
  }

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleBuyClick = () => {
    if (products.length === 0) return;
    const prod = selectedProduct || (products && products[0]);
    setOrderData(prev => ({
      ...prev,
      quantity: quantity,
      productId: prod?._id,
      productName: prod?.name,
      totalPrice: prod?.price?.current * quantity
    }));
    try {
      const productId = prod && (prod._id || prod.id) ? (prod._id || prod.id) : null;
      const cartItem = {
        product: productId,
        id: productId,
        _id: productId,
        title: prod?.name,
        price: prod?.price?.current,
        quantity: quantity
      };
      localStorage.setItem('cart', JSON.stringify([cartItem]));
      localStorage.setItem('checkoutPrice', (prod?.price?.current * quantity).toFixed(2));
      localStorage.setItem('checkoutCurrency', (prod?.price?.currency || 'zł'));
      localStorage.setItem('productName', prod?.name || '');
    } catch (err) {
      console.warn('Failed to prefill cart in localStorage', err);
    }
    setShowOrderForm(true);
  }

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    // Сохраняем данные клиента и адрес в localStorage и перенаправляем на страницу оплаты (Stripe)
    try {
      const fullName = `${orderData.firstName || ''} ${orderData.lastName || ''}`.trim();
      localStorage.setItem('customerName', fullName);
      localStorage.setItem('customerEmail', orderData.email || '');
      localStorage.setItem('customerPhone', orderData.phone || '');
      localStorage.setItem('customerAddress', orderData.address || '');
      localStorage.setItem('customerCity', orderData.city || '');
      // Сохраняем сумму и название продукта для отображения на странице оплаты
      const prod = selectedProduct || (products && products[0]);
      const price = prod && prod.price ? prod.price.current.toFixed(2) : '0.00';
      const productName = prod && prod.name ? prod.name : '';
      localStorage.setItem('checkoutPrice', price);
      const currency = prod && prod.price ? prod.price.currency : 'zł';
      localStorage.setItem('checkoutCurrency', currency || 'zł');
      localStorage.setItem('productName', productName);

      // Store cart items so the stripe page can read them
      try {
        const productId = prod && (prod._id || prod.id) ? (prod._id || prod.id) : null;
        const cartItem = {
          product: productId,
          id: productId,
          _id: productId,
          title: productName,
          price: parseFloat(price),
          quantity: quantity
        };
        localStorage.setItem('cart', JSON.stringify([cartItem]));
      } catch (err) {
        // Non-fatal; continue
        console.warn('Failed to set cart in localStorage', err);
      }

      // Перенаправляем на страницу оплаты
      window.location.href = '/src/stripe/index.html';
    } catch (err) {
      alert('❌ Ошибка при подготовке к оплате: ' + err.message);
    }
  }

  // Страница благодарности после заказа
  if (showOrderSuccess) {
    return (
      <div className="app">
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #008F51 0%, #006839 100%)',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '60px 40px',
            textAlign: 'center',
            maxWidth: '500px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              fontSize: '72px',
              marginBottom: '20px'
            }}>✅</div>
            
            <h1 style={{
              color: '#008F51',
              fontSize: '32px',
              margin: '0 0 20px 0',
              fontFamily: 'Arial, sans-serif'
            }}>Twoje zamówienie przyjęte!</h1>
            
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>Dziękujemy za Twoje zamówienie! Wkrótce skontaktujemy się z Tobą w celu potwierdzenia szczegółów dostawy.</p>
            
            <p style={{
              fontSize: '14px',
              color: '#999',
              marginBottom: '40px'
            }}>Numer zamówienia zostanie wysłany na Twój email.</p>
            
            <button 
              onClick={() => {
                setShowOrderSuccess(false)
                setQuantity(1)
              }}
              style={{
                padding: '14px 40px',
                background: '#008F51',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = '#006839'}
              onMouseOut={(e) => e.target.style.background = '#008F51'}
            >
              Powrót do sklepu
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <img 
          src="/logo.svg"
          alt="Logo"
          className="logo"
        />
        <nav className="nav">
          <a href="#" className="nav-link">Produkt</a>
          <a href="#" className="nav-link">Cechy</a>
          <a href="#" className="nav-link">Opinie</a>
          <a href="#" className="nav-link">FAQ</a>
        </nav>
      </header>
      
      <main className="main">
        <div className="hero">
          <img 
            src="/Grd.svg"
            alt="Gradient"
            className="gradient-bg"
          />
          <img 
            src="/Pod-1.svg"
            alt="Pod"
            className="pod-image"
          />
          <div className="product-title">
          <h2>
              {selectedProduct && selectedProduct.name ? (
                    selectedProduct.name
                  ) : (products.length > 0 && products[0].name ? products[0].name : (
                <>
                  Sinnespaneele mit Himmelsmotiven 
                  <br className="desktop-br" /> {/* Добавляем управляемый перенос */}
                  Großes 6-teiliges Aktivitätsbrett für Kinder
                </>
                  ))}
            </h2>
            <div className="rating">
              <img src="/Star.svg" alt="Star" className="star" />
              <img src="/Star.svg" alt="Star" className="star" />
              <img src="/Star.svg" alt="Star" className="star" />
              <img src="/Star.svg" alt="Star" className="star" />
              <img src="/Star.svg" alt="Star" className="star" />
              <span className="rating-text">({selectedProduct ? (selectedProduct.reviewsCount !== undefined ? selectedProduct.reviewsCount : 22) : (products.length > 0 ? (products[0].reviewsCount !== undefined ? products[0].reviewsCount : 22) : 22)})</span>
            </div>
            <div className="price-row">
              <div className="price-current">{selectedProduct ? (selectedProduct.price.current * quantity).toFixed(2) : (products.length > 0 ? (products[0].price.current * quantity).toFixed(2) : '409.99')} {selectedProduct ? selectedProduct.price.currency : (products.length > 0 ? products[0].price.currency : 'zł')}</div>
              <div className="price-old">{selectedProduct ? (selectedProduct.price.old * quantity).toFixed(2) : (products.length > 0 ? (products[0].price.old * quantity).toFixed(2) : '829.99')} {selectedProduct ? selectedProduct.price.currency : (products.length > 0 ? products[0].price.currency : 'zł')}</div>
            </div>
            <div className="delivery">Darmowa dostawa</div>
            <button className="btn-add" onClick={handleBuyClick}>Dodaj do koszyka</button>
          </div>
          <img src="/Preview-1.svg" alt="Preview 1" className="preview preview-1" />
          <img src="/Preview-2.svg" alt="Preview 2" className="preview preview-2" />
          <img src="/Preview-3.svg" alt="Preview 3" className="preview preview-3" />
          <img src="/Preview-4.svg" alt="Preview 4" className="preview preview-4" />
        </div>
        
        <div className="features-section">
          <h2 className="features-title">Cechy</h2>
          <p className="features-subtitle">Porównaj rozmiary i znajdź idealne dopasowanie.</p>
          
          <div className="features-table-container">
            <table className="features-table">
              <thead>
                <tr>
                  <th>Parametr</th>
                  <th>Standard</th>
                  <th>Duży</th>
                  <th>Bardzo duży</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Wymiary</td>
                  <td>54 x 36 x 12 cm</td>
                  <td>60 x 41 x 15 cm</td>
                  <td>74 x 46 x 19 cm</td>
                </tr>
                <tr>
                  <td>Waga</td>
                  <td>712 g</td>
                  <td>922 g</td>
                  <td>1,134 g</td>
                </tr>
                <tr>
                  <td>Wypełnienie</td>
                  <td colSpan="3">100% pianka z pamięcią kształtu z certyfikatem CertiPUR-US</td>
                </tr>
                <tr>
                  <td>Pielęgnacja</td>
                  <td colSpan="3">Poszewkę można prać w pralce / Piankę czyścić miejscowo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="reviews-section">
          <h2 className="reviews-title">Co mówią klienci</h2>
          
          <div className="reviews-container">
            <div className="review-card">
              <div className="review-stars">
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
              </div>
              <p className="review-text">Wypróbowałam wiele poduszek, ale tylko PilloSettle zmniejszyła poranne bóle karku. Warta każdej złotówki.</p>
              <h4 className="review-name">Nina</h4>
              <p className="review-title">Zweryfikowany kupujący</p>
            </div>

            <div className="review-card">
              <div className="review-stars">
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
              </div>
              <p className="review-text">Po tygodniu używania zauważyłem ogromną różnicę — napięcie w szyi praktycznie zniknęło, a sen stał się głębszy</p>
              <h4 className="review-name">Dylan</h4>
              <p className="review-title">Zweryfikowany kupujący</p>
            </div>

            <div className="review-card">
              <div className="review-stars">
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
              </div>
              <p className="review-text">Efekt chłodzący naprawdę działa — nie budzę się już spocony, a bambusowa poszewka jest bardzo miękka.</p>
              <h4 className="review-name">Emma</h4>
              <p className="review-title">Zweryfikowany kupujący</p>
            </div>
                        <div className="review-card">
              <div className="review-stars">
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
              </div>
              <p className="review-text">Polecona przez chiropraktyka — po dwóch nocach przyzwyczajenia nie wyobrażam sobie snu bez niej.</p>
              <h4 className="review-name">Noah</h4>
              <p className="review-title">Zweryfikowany kupujący</p>
            </div>
                        <div className="review-card">
              <div className="review-stars">
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
              </div>
              <p className="review-text">Szybka dostawa i świetna obsługa — poduszka w godzinę osiągnęła idealny kształt.</p>
              <h4 className="review-name">Lucas</h4>
              <p className="review-title">Zweryfikowany kupujący</p>
            </div>
                        <div className="review-card">
              <div className="review-stars">
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
              </div>
              <p className="review-text">„Śpię na niej każdej nocy i budzę się bez sztywności szyi. Świetny produkt i bardzo dobra jakość wykonania.”</p>
              <h4 className="review-name">Anna</h4>
              <p className="review-title">Zweryfikowany kupujący</p>
            </div>

            <div className="review-card">
              <div className="review-stars">
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
                <img src="/Star.svg" alt="Star" className="review-star" />
              </div>
              <p className="review-text">Poduszka idealnie dopasowuje się do głowy i karku. Materiał oddycha, a uczucie świeżości utrzymuje się całą noc</p>
              <h4 className="review-name">Klaus</h4>
              <p className="review-title">Zweryfikowany kupujący</p>
            </div>
          </div>
        </div>

        <div className="footer-showcase">
          <div className="footer-content">
            <div className="footer-info">
              <h3 className="footer-title">Derila Ergo</h3>
              <p className="footer-subtitle">Rozmiar standardowy</p>
            </div>
            <div className="footer-pricing">
              <div className="footer-price-current">{selectedProduct ? (selectedProduct.price.current * quantity).toFixed(2) : (products.length > 0 ? (products[0].price.current * quantity).toFixed(2) : '409.99')} {selectedProduct ? selectedProduct.price.currency : (products.length > 0 ? products[0].price.currency : 'zł')}</div>
              <div className="footer-price-old">{selectedProduct ? (selectedProduct.price.old * quantity).toFixed(2) : (products.length > 0 ? (products[0].price.old * quantity).toFixed(2) : '829.99')} {selectedProduct ? selectedProduct.price.currency : (products.length > 0 ? products[0].price.currency : 'zł')}</div>
            </div>
            <div className="footer-quantity">
              <button className="qty-btn" onClick={handleQuantityDecrease}>−</button>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="qty-input" 
                min="1"
              />
              <button className="qty-btn" onClick={handleQuantityIncrease}>+</button>
            </div>
            <button className="footer-btn-add" onClick={handleBuyClick}>Dodaj do koszyka</button>
            <div className="footer-trust">
              <div className="trust-item">
                <img src="/Security.svg" alt="Security" className="trust-icon" />
                <span className="trust-text">Bezpieczna płatność z<br />użyciem protokołu SSL</span>
              </div>
              <div className="trust-item">
                <img src="/Lock.svg" alt="Lock" className="trust-icon" />
                <span className="trust-text">Gwarancja poufności</span>
              </div>
            </div>
          </div>
        </div>

        <div className="faq-section">
          <h2 className="faq-title">Najczęściej zadawane pytania</h2>
          <p className="faq-subtitle">Wszystko, co musisz wiedzieć o swoim nowym towarzyszu snu.</p>
          
          <div className="faq-container">
            {faqItems.map((item) => (
              <div 
                key={item.id} 
                className={`faq-item ${expandedFAQ === item.id ? 'expanded' : ''}`}
                onClick={() => toggleFAQ(item.id)}
              >
                <div className="faq-header">
                  <h3 className="faq-question">{item.question}</h3>
                  <img 
                    src="/Alt-Arrow.svg" 
                    alt="Toggle" 
                    className="faq-arrow" 
                  />
                </div>
                {expandedFAQ === item.id && (
                  <div className="faq-answer">{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-main">
          <div className="footer-left">
            <img src="/logo.svg" alt="Logo" className="footer-logo" />
            <p className="footer-description">
              Poczuj niezrównany komfort ortopedyczny. Nasza konstrukcja jednopunktowego podparcia zapewnia idealne ułożenie szyi i kręgosłupa, dzięki czemu możesz spać spokojnie i dbać o swoje zdrowie.
            </p>
          </div>

          <div className="footer-links">
            <h4 className="footer-links-title">Szybki dostęp</h4>
            <ul className="footer-nav">
              <li><a href="#" className="footer-link">Produkt</a></li>
              <li><a href="#" className="footer-link">Cechy</a></li>
              <li><a href="#" className="footer-link">Opinie</a></li>
              <li><a href="#" className="footer-link">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p className="footer-copyright">© 2026 PilloSettle. Wszelkie prawa zastrzeżone. Stworzone z myślą o Twoim najlepszym śnie.</p>
        </div>
      </footer>

      {/* Модальное окно формы заказа */}
      {showOrderForm && (
        <div className="order-modal-overlay" onClick={() => setShowOrderForm(false)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowOrderForm(false)}>✕</button>
            <h2>Potwierdzenie zamówienia</h2>
            <form onSubmit={handleOrderSubmit} className="order-form">
              <div className="form-group">
                <label>Imię *</label>
                <input 
                  type="text" 
                  required 
                  value={orderData.firstName}
                  onChange={(e) => setOrderData({...orderData, firstName: e.target.value})}
                  placeholder="Twoje imię"
                />
              </div>

              <div className="form-group">
                <label>Nazwisko *</label>
                <input 
                  type="text" 
                  required 
                  value={orderData.lastName}
                  onChange={(e) => setOrderData({...orderData, lastName: e.target.value})}
                  placeholder="Twoje nazwisko"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  required 
                  value={orderData.email}
                  onChange={(e) => setOrderData({...orderData, email: e.target.value})}
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label>Telefon *</label>
                <input 
                  type="tel" 
                  required 
                  value={orderData.phone}
                  onChange={(e) => setOrderData({...orderData, phone: e.target.value})}
                  placeholder="+48 123 456 789"
                />
              </div>

              <div className="form-group">
                <label>Adres *</label>
                <input 
                  type="text" 
                  required 
                  value={orderData.address}
                  onChange={(e) => setOrderData({...orderData, address: e.target.value})}
                  placeholder="Ulica i numer domu"
                />
              </div>

              <div className="form-group">
                <label>Miasto *</label>
                <input 
                  type="text" 
                  required 
                  value={orderData.city}
                  onChange={(e) => setOrderData({...orderData, city: e.target.value})}
                  placeholder="Twoje miasto"
                />
              </div>

              <div className="form-group">
                <label>Kod pocztowy *</label>
                <input 
                  type="text" 
                  required 
                  value={orderData.zipCode}
                  onChange={(e) => setOrderData({...orderData, zipCode: e.target.value})}
                  placeholder="00-000"
                />
              </div>

              <div className="form-summary">
                <p>Produkt: {selectedProduct ? selectedProduct.name : (products.length > 0 ? products[0].name : 'N/A')}</p>
                <p>Ilość: {quantity}</p>
                <p className="total-price">Razem: {selectedProduct ? (selectedProduct.price.current * quantity).toFixed(2) : (products.length > 0 ? (products[0].price.current * quantity).toFixed(2) : '0')} {selectedProduct ? selectedProduct.price.currency : (products.length > 0 ? products[0].price.currency : 'zł')}</p>
              </div>

              <button type="submit" className="btn-submit">Potwierdź zamówienie</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

