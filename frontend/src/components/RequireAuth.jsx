import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { getToken } from '../utils/tokenStorage'

export default function RequireAuth({ children }) {
  const token = getToken()

  useEffect(() => {
    // Covers the back-forward-cache case: if the browser restores this page
    // from bfcache (e.g. pressing Back right after logout), it resumes the
    // frozen page instantly without re-running React, so the render-time
    // check above never re-executes. `pageshow` fires even on a bfcache
    // restore, so re-check the token there and bounce out if it's gone.
    const handlePageShow = (event) => {
      if (event.persisted && !getToken()) {
        window.location.replace('/login')
      }
    }

    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}
