import Cookies from 'js-cookie'

const TOKEN_COOKIE = 'token'

export function getToken() {
  return Cookies.get(TOKEN_COOKIE) || null
}

export function setToken(token) {
  // 7 days to match the backend's JWT expiresIn.
  Cookies.set(TOKEN_COOKIE, token, { expires: 7, sameSite: 'Lax' })
}

export function removeToken() {
  Cookies.remove(TOKEN_COOKIE)
}
