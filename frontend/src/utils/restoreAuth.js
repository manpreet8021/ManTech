import { jwtDecode } from 'jwt-decode'
import { getToken, removeToken } from './tokenStorage'

// Reads the stored token (if any) and rebuilds the auth slice's shape from
// its payload, so a page refresh doesn't lose role/permissions and bounce
// the user back to /login. The token was issued by our own server and is
// only being read here, not trusted for anything security-sensitive — every
// real request still carries it to the backend, which verifies the signature.
export function restoreAuthState() {
  const token = getToken()
  if (!token) return null

  try {
    const decoded = jwtDecode(token)

    if (!decoded.exp || decoded.exp * 1000 <= Date.now()) {
      removeToken()
      return null
    }

    return {
      user: decoded.data.email,
      role: decoded.data.role,
      permissions: decoded.data.permissions || [],
    }
  } catch {
    removeToken()
    return null
  }
}
