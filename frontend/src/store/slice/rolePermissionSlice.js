import { createSlice } from '@reduxjs/toolkit'
import rolePermissionApiSlice from './api/rolePermissionApiSlice'

export const initialState = {
  roles: []
}

const rolePermissionSlice = createSlice({
  name: 'rolePermission',
  initialState,
  reducers: {
    setRoles: (state, action) => {
      state.roles = action.payload
    }
  },
  extraReducers(builder) {
    builder.addMatcher(
      rolePermissionApiSlice.endpoints.getAllRoles.matchFulfilled,
      (state, {payload}) => {
        state.roles = payload;
      },
    )
  },
})

export const { setRoles } = rolePermissionSlice.actions
export default rolePermissionSlice.reducer
