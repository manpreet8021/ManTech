import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Points at the Node backend once it exists. Set VITE_API_BASE_URL in a .env
// file to override for local dev.
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Video', 'Quiz'],
  endpoints: () => ({
    // Add real endpoints here as the Node backend comes online, e.g.:
    //
    // login: builder.mutation({
    //   query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
    // }),
    // getVideos: builder.query({
    //   query: () => '/videos',
    //   providesTags: ['Video'],
    // }),
    // getVideoById: builder.query({
    //   query: (videoId) => `/videos/${videoId}`,
    //   providesTags: (result, error, videoId) => [{ type: 'Video', id: videoId }],
    // }),
  }),
})
