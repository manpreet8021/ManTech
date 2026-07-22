import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { logout } from '../authSlice'
import { getToken, removeToken } from '../../../utils/tokenStorage'

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    const token = getToken()

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return headers
  },
})

const baseQueryWithAuthHandling = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions)

  if (result?.error?.status === 401) {
    removeToken()
    api.dispatch(logout())
  }

  return result
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: ['Video', 'Quiz', 'User', 'Course'],
  endpoints: () => ({}),
})
