import { apiClient } from './config.js'

export const productService = {
  async getProducts(query = '') {
    try {
      const endpoint = query ? `/products?search=${query}` : '/products'
      return await apiClient.get(endpoint)
    } catch (error) {
      console.error('Failed to fetch products from API:', error.message)
      // Возвращаем пустой массив чтобы приложение не сломалось
      return { data: [] }
    }
  },

  async getProduct(id) {
    try {
      return await apiClient.get(`/products/${id}`)
    } catch (error) {
      return null
    }
  },

  async createProduct(productData) {
    try {
      return await apiClient.post('/products', productData)
    } catch (error) {
      throw error
    }
  },

  async updateProduct(id, productData) {
    try {
      return await apiClient.put(`/products/${id}`, productData)
    } catch (error) {
      throw error
    }
  },

  async deleteProduct(id) {
    try {
      return await apiClient.delete(`/products/${id}`)
    } catch (error) {
      throw error
    }
  },
}

export const orderService = {
  async createOrder(orderData) {
    try {
      return await apiClient.post('/orders', orderData)
    } catch (error) {
      throw error
    }
  },

  async getOrders() {
    try {
      return await apiClient.get('/orders')
    } catch (error) {
      return { data: [] }
    }
  },

  async getOrder(id) {
    try {
      return await apiClient.get(`/orders/${id}`)
    } catch (error) {
      return null
    }
  },
}

export const authService = {
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData)
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token)
      }
      return response
    } catch (error) {
      throw error
    }
  },

  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token)
      }
      return response
    } catch (error) {
      throw error
    }
  },

  logout() {
    localStorage.removeItem('auth_token')
  },

  async getCurrentUser() {
    try {
      return await apiClient.get('/auth/me')
    } catch (error) {
      console.error('Failed to fetch current user:', error)
      return null
    }
  },
}

export const cartService = {
  addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += product.quantity || 1
    } else {
      cart.push({ ...product, quantity: product.quantity || 1 })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    return cart
  },

  getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]')
  },

  removeFromCart(productId) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const filtered = cart.filter(item => item.id !== productId)
    localStorage.setItem('cart', JSON.stringify(filtered))
    return filtered
  },

  clearCart() {
    localStorage.removeItem('cart')
    return []
  },

  updateQuantity(productId, quantity) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const item = cart.find(item => item.id === productId)
    
    if (item) {
      item.quantity = quantity
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    return cart
  },
}
