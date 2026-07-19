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
        })
    })
})

export const { useCreateUserMutation, useGetAllUserQuery } = userApiSlice;

export default userApiSlice