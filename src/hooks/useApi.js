import { useState, useEffect } from 'react'
import { productService, orderService, authService, cartService } from '../api/services.js'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProducts = async (query = '') => {
    setLoading(true)
    setError(null)
    try {
      const result = await productService.getProducts(query)
      setProducts(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return { products, loading, error, fetchProducts }
}

export function useCart() {
  const [cart, setCart] = useState([])

  useEffect(() => {
    setCart(cartService.getCart())
  }, [])

  const addToCart = (product) => {
    const updated = cartService.addToCart(product)
    setCart(updated)
  }

  const removeFromCart = (productId) => {
    const updated = cartService.removeFromCart(productId)
    setCart(updated)
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      const updated = cartService.updateQuantity(productId, quantity)
      setCart(updated)
    }
  }

  const clearCart = () => {
    cartService.clearCart()
    setCart([])
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  }
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    if (localStorage.getItem('auth_token')) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authService.login(credentials)
      setUser(response.user || response)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authService.register(userData)
      setUser(response.user || response)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return { user, loading, error, login, register, logout }
}

export function useOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createOrder = async (orderData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderService.createOrder(orderData)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, createOrder }
}
