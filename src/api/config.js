// Автоматически определяем протокол на основе текущего протокола страницы
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  let baseUrl = '';
  
  if (envUrl) {
    // Если URL из переменной окружения начинается с http://, но страница загружена по HTTPS,
    // автоматически меняем на HTTPS
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envUrl.startsWith('http://')) {
      baseUrl = envUrl.replace('http://', 'https://');
    } else {
      baseUrl = envUrl;
    }
  } else {
    // Для локальной разработки
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      baseUrl = 'http://localhost:3000/api';
    } else if (typeof window !== 'undefined') {
      // Для production используем относительный путь (работает через прокси или если API на том же домене)
      baseUrl = '/api';
    } else {
      // Fallback для SSR или других случаев
      baseUrl = 'https://derila.pro/api';
    }
  }
  
  // Убеждаемся, что URL заканчивается на /api
  // Убираем завершающий слеш если есть
  baseUrl = baseUrl.replace(/\/$/, '');
  
  // Если URL не заканчивается на /api, добавляем его
  if (!baseUrl.endsWith('/api')) {
    // Если это полный URL (начинается с http:// или https://)
    if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
      baseUrl = `${baseUrl}/api`;
    } else {
      // Если это относительный путь, просто добавляем /api
      baseUrl = `${baseUrl}/api`;
    }
  }
  
  return baseUrl;
}

export const API_BASE_URL = getApiBaseUrl()

export const apiClient = {
  async request(endpoint, options = {}) {
    // Нормализуем endpoint: убираем начальный слеш если есть
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint
    
    // Если endpoint начинается с 'api/', убираем его (так как API_BASE_URL уже содержит /api)
    if (cleanEndpoint.startsWith('api/')) {
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
