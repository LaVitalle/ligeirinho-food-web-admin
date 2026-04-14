import { Navigate, Outlet } from 'react-router-dom'

import { isAccessTokenExpired } from '../../lib/auth'
import { useAuthStore } from '../../stores/authStore'

export function PrivateRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />
  }

  if (isAccessTokenExpired(token)) {
    logout()
    return null
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
