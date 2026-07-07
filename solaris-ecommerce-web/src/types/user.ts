export type Role = 'ADMIN' | 'CUSTOMER' | 'STAFF'

export type AuthProvider = 'LOCAL' | 'GOOGLE'

export type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  role?: Role
  authProvider: AuthProvider
  emailVerified: boolean
  platformOperator: boolean
}
