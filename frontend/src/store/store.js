import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from './slice/api/apiSlice'
import authReducer, { initialState as authInitialState } from './slice/authSlice'
import { restoreAuthState } from '../utils/restoreAuth'
import rolePermissionSliceReducer from './slice/rolePermissionSlice'
import userSliceReducer from './slice/userSlice'

const restoredAuth = restoreAuthState()

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    rolePermission: rolePermissionSliceReducer,
    user: userSliceReducer
  },
  preloadedState: restoredAuth
    ? { auth: { ...authInitialState, ...restoredAuth } }
    : undefined,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
})
