import apiClient from './axiosClient'

export type RegisterData = {
  firstname: string
  lastname: string
  email: string
  password: string
}

export type LoginData = {
  email: string
  password: string
}

export type AuthResponse = {
  token?: string
  email: string
  role?: string
  firstname: string
  lastname: string
  message?: string
  requiresVerification?: boolean
}

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/authenticate', data)
    return response.data
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    const response = await apiClient.get('/auth/verify-email', { params: { token } })
    return response.data
  },

  resendVerification: async (email: string): Promise<void> => {
    await apiClient.post('/auth/resend-verification', { email })
  },
}
