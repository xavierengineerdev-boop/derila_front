import { apiClient } from './config.js'

export const productService = {
  // Get all products
  async getProducts(query = '') {
    try {
      const endpoint = query ? `/products?search=${query}` : '/products'
      return await apiClient.get(endpoint)
    } catch (error) {
      return { data: [] }
    }
  },

  // Get single product
  async getProduct(id) {
    try {
      return await apiClient.get(`/products/${id}`)
    } catch (error) {
      return null
    }
  },

  // Create product (admin)
  async createProduct(productData) {
    try {
      return await apiClient.post('/products', productData)
    } catch (error) {
      throw error
    }
  },

  // Update product (admin)
  async updateProduct(id, productData) {
    try {
      return await apiClient.put(`/products/${id}`, productData)
    } catch (error) {
      throw error
    }
  },

  // Delete product (admin)
  async deleteProduct(id) {
    try {
      return await apiClient.delete(`/products/${id}`)
    } catch (error) {
      throw error
    }
  },
}

export const orderService = {
  // Create order
  async createOrder(orderData) {
    try {
      return await apiClient.post('/orders', orderData)
    } catch (error) {
      throw error
    }
  },

  // Get orders
  async getOrders() {
    try {
      return await apiClient.get('/orders')
    } catch (error) {
      return { data: [] }
    }
  },

  // Get order by ID
  async getOrder(id) {
    try {
      return await apiClient.get(`/orders/${id}`)
    } catch (error) {
      return null
    }
  },
}

export const authService = {
  // Register user
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

  // Login user
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

  // Logout user
  logout() {
    localStorage.removeItem('auth_token')
  },

  // Get current user
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
  // Add to cart (local storage)
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

  // Get cart
  getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]')
  },

  // Remove from cart
  removeFromCart(productId) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const filtered = cart.filter(item => item.id !== productId)
    localStorage.setItem('cart', JSON.stringify(filtered))
    return filtered
  },

  // Clear cart
  clearCart() {
    localStorage.removeItem('cart')
    return []
  },

  // Update cart item quantity
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
