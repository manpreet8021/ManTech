import { createSlice } from '@reduxjs/toolkit'
import userApiSlice from './api/userApiSlice'

export const initialState = {
  users: []
}

const useSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.users = action.payload
    }
  },
  extraReducers(builder) {
    builder.addMatcher(
      userApiSlice.endpoints.getAllUser.matchFulfilled,
      (state, {payload}) => {
        state.users = payload;
      },
    )
    .addMatcher(
        userApiSlice.endpoints.createUser.matchFulfilled,
        (state, {payload}) => {
            state.users = [...state.users, payload]
        }
    )
    .addMatcher(
        userApiSlice.endpoints.updateUser.matchFulfilled,
        (state, {payload}) => {
            const index = state.users.findIndex((u) => u.id === payload.id)
            if (index !== -1) {
                state.users[index] = payload
            }
        }
    )
    .addMatcher(
        userApiSlice.endpoints.deleteUser.matchFulfilled,
        (state, {payload}) => {
            state.users = state.users.filter((u) => u.id !== payload.id)
        }
    )
  },
})

export const { setUser } = useSlice.actions
export default useSlice.reducer
