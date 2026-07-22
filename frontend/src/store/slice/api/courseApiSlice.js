import { apiSlice } from "./apiSlice";

const courseApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createCourse: builder.mutation({
            query: (data) => ({
                url: 'course/',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Course']
        }),
        getAllCourse: builder.query({
            query: (data) => ({
                url: 'course/',
                method: 'GET'
            }),
            providesTags: ['Course']
        }),
        updateCourse: builder.mutation({
            query: (data) => ({
                url: 'course/',
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ['Course']
        }),
        deleteCourse: builder.mutation({
            query: (id) => ({
                url: `course/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Course']
        })
    })
})

export const { useCreateCourseMutation, useDeleteCourseMutation, useGetAllCourseQuery, useUpdateCourseMutation } = courseApiSlice;

export default courseApiSlice