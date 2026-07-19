import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { hasResource } from '../utils/permissions'

export default function RequirePermission({ resource, children }) {
  const permissions = useSelector((state) => state.auth.permissions)

  if (!hasResource(permissions, resource)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
