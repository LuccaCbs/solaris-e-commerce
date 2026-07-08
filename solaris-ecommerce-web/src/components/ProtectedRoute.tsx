import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'

type ProtectedRouteProps = {
  children: ReactNode
  requireAdmin?: boolean
}

const getStoredUser = () => {
  const token = localStorage.getItem('token')
  const userJson = localStorage.getItem('user')
  if (!token || !userJson) return null
  try {
    return JSON.parse(userJson)
  } catch {
    return null
  }
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const user = getStoredUser()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !['ADMIN', 'STAFF'].includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
