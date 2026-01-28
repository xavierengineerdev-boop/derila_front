// Автоматически определяем протокол на основе текущего протокола страницы
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    // Если URL из переменной окружения начинается с http://, но страница загружена по HTTPS,
    // автоматически меняем на HTTPS
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envUrl.startsWith('http://')) {
      return envUrl.replace('http://', 'https://');
    }
    return envUrl;
  }
  
  // Для локальной разработки
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3000/api';
  }
  
  // По умолчанию используем HTTPS для production
  return 'https://derila.pro/api';
}

export const API_BASE_URL = getApiBaseUrl()

export const apiClient = {
  async request(endpoint, options = {}) {
    // Нормализуем endpoint: убираем начальный слеш если есть, добавляем если нет
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint
    
    // Если API_BASE_URL уже содержит /api, а endpoint начинается с /api, убираем /api из endpoint
    if (API_BASE_URL.endsWith('/api') && cleanEndpoint.startsWith('api/')) {
      cleanEndpoint = cleanEndpoint.substring(4) // Убираем 'api/'
    }
    
    // Убираем завершающий слеш из API_BASE_URL если есть
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
    const url = `${baseUrl}/${cleanEndpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    }

    const token = localStorage.getItem('auth_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      console.log('API Request:', url) // Для отладки
      
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Проверяем Content-Type перед парсингом JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('API returned non-JSON response:', {
          url,
          status: response.status,
          contentType,
          preview: text.substring(0, 200)
        })
        throw new Error(`API returned HTML instead of JSON. Status: ${response.status}. URL: ${url}`)
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', {
          url,
          status: response.status,
          body: errorText
        })
        throw new Error(`API Error: ${response.status} - ${errorText.substring(0, 100)}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', {
        url,
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  },

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  },
}
