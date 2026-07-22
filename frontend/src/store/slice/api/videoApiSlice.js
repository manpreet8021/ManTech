import { apiSlice } from "./apiSlice";

const videoApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createVideo: builder.mutation({
            query: (formData) => ({
                url: 'video/',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Video']
        }),
        getAllVideos: builder.query({
            query: (courseId) => ({
                url: `video/${courseId}`,
                method: 'GET'
            }),
            providesTags: ['Video']
        }),
        getVideoDetail: builder.query({
            query: (videoId) => ({
                url: `video/detail/${videoId}`,
                method: 'GET'
            }),
            providesTags: ['Video']
        }),
    })
})

export const { useCreateVideoMutation, useGetAllVideosQuery, useGetVideoDetailQuery } = videoApiSlice;

export default videoApiSlice
