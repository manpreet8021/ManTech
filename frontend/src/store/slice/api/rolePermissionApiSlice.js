import { apiSlice } from "./apiSlice";

const rolePermissionApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllRoles: builder.query({
            query: (data) => ({
                url: 'rolePermission/role',
                method: 'GET',
            })
        })
    })
})

export const { useGetAllRolesQuery } = rolePermissionApiSlice;

export default rolePermissionApiSlice