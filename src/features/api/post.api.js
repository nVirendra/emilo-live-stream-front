import { baseApi } from './api';

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => 'posts/feed',

      // 👇 Normalize response to always be an array
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;               // already an array
        if (Array.isArray(response?.result)) return response.result;
        if (Array.isArray(response?.posts)) return response.posts;
        return [];                                                  // fallback
      },

      providesTags: (posts = []) =>
        posts.length
          ? [
              ...posts.map(({ _id }) => ({ type: 'Post', id: _id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    addPost: builder.mutation({
      query: (body) => ({
        url: 'posts',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
  }),
});

export const { useGetPostsQuery, useAddPostMutation } = postApi;
