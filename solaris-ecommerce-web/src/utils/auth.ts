export type AuthUser = {
  id?: number
  email: string
  role?: string
  firstname: string
  lastname: string
}

export const getStoredUser = (): AuthUser | null => {
  const token = localStorage.getItem('token')
  const userJson = localStorage.getItem('user')
  if (!token || !userJson) return null
  try {
    return JSON.parse(userJson)
  } catch {
    return null
  }
}

export const isAdminUser = (user: AuthUser | null) =>
  user != null && ['ADMIN', 'STAFF'].includes(user.role || '')

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}
