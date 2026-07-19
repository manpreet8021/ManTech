import { createSlice } from '@reduxjs/toolkit'

const initialState = {
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
    },
    logout: (state) => {
      state.user = null
      state.role = null
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
