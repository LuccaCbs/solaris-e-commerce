import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const userJson = localStorage.getItem('user')
    if (userJson) {
      try {
        const user = JSON.parse(userJson)
        if (user?.id) {
          config.headers['X-User-Id'] = user.id
        }
      } catch {
        // ignore invalid user data
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ['/', '/catalog', '/shop', '/cart', '/login', '/register', '/verify-email']
      const isPublicPath = publicPaths.some(
        (path) =>
          window.location.pathname === path ||
          window.location.pathname.startsWith('/catalog') ||
          window.location.pathname.startsWith('/shop')
      )
      if (!isPublicPath) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
