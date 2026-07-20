import { apiSlice } from "./apiSlice";

const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createUser: builder.mutation({
            query: (data) => ({
                url: 'user/',
                method: 'POST',
                body: data
            })
        }),
        getAllUser: builder.query({
            query: (data) => ({
                url: 'user/',
                method: 'GET'
            })
        }),
        updateUser: builder.mutation({
            query: (data) => ({
                url: 'user/',
                method: 'PUT',
                body: data
            })
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `user/${id}`,
                method: 'DELETE'
            })
        })
    })
})

export const { useCreateUserMutation, useGetAllUserQuery, useUpdateUserMutation, useDeleteUserMutation } = userApiSlice;

export default userApiSlice