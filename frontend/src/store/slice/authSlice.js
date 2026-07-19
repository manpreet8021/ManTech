import { createSlice } from '@reduxjs/toolkit'

export const initialState = {
  user: null,
  role: null, // 'student' | 'teacher'
  permissions: []
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.role = action.payload.role
      state.permissions = action.payload.permissions || []
    },
    logout: (state) => {
      state.user = null
      state.role = null
      state.permissions = []
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
