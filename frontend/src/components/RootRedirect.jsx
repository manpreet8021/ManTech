import { Navigate } from 'react-router-dom'
import { getToken } from '../utils/tokenStorage'

export default function RootRedirect() {
  return <Navigate to={getToken() ? '/dashboard' : '/login'} replace />
}
