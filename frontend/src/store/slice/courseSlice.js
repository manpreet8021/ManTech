import { createSlice } from '@reduxjs/toolkit'
import courseApiSlice from './api/courseApiSlice';

export const initialState = {
  course: []
}

const courseSlice = createSlice({
  name: 'course',
  initialState,
  extraReducers(builder) {
    builder.addMatcher(
      courseApiSlice.endpoints.getAllCourse.matchFulfilled,
      (state, {payload}) => {
        state.course = payload;
      },
    )
    .addMatcher(
        courseApiSlice.endpoints.createCourse.matchFulfilled,
        (state, {payload}) => {
            state.course = [...state.course, payload]
        }
    )
    .addMatcher(
        courseApiSlice.endpoints.updateCourse.matchFulfilled,
        (state, {payload}) => {
            const index = state.course.findIndex((c) => c.id === payload.id)
            if (index !== -1) {
                state.course[index] = payload
            }
        }
    )
    .addMatcher(
        courseApiSlice.endpoints.deleteCourse.matchFulfilled,
        (state, {payload}) => {
            state.course = state.course.filter((c) => c.id !== payload.id)
        }
    )
  },
})

// export const { setUser } = courseSlice.actions
export default courseSlice.reducer
