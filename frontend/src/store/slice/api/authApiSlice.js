import { apiSlice } from "./apiSlice";

const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: 'auth/login',
                method: 'POST',
                body: data
            })
        }),
        resetPassword: builder.mutation({
            query: (data) => ({
                url: 'auth/reset-password',
                method: 'POST',
                body: data
            })
        })
    })
})

export const { useLoginMutation, useResetPasswordMutation } = authApiSlice;

export default authApiSlice