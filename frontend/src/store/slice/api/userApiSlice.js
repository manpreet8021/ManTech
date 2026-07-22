import { apiSlice } from "./apiSlice";

const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createUser: builder.mutation({
            query: (data) => ({
                url: 'user/',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['User']
        }),
        getAllUser: builder.query({
            query: (data) => ({
                url: 'user/',
                method: 'GET'
            }),
            providesTags: ['User']
        }),
        getAllManagers: builder.query({
            query: () => ({
                url: 'user/managers',
                method: 'GET'
            }),
            providesTags: ['User']
        }),
        updateUser: builder.mutation({
            query: (data) => ({
                url: 'user/',
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ['User']
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `user/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['User']
        })
    })
})

export const { useCreateUserMutation, useGetAllUserQuery, useGetAllManagersQuery, useUpdateUserMutation, useDeleteUserMutation } = userApiSlice;

export default userApiSlice