import { baseApi } from './api';

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query({
      // accepts { page, limit }
      query: ({ page = 1, limit = 2 }) =>
        `posts/feed?page=${page}&limit=${limit}`,

      // ─── Keep ONE cache entry for *all* pages ──────────────
      serializeQueryArgs: ({ endpointName }) => endpointName,

      // ─── Merge new page into existing cache ────────────────
      merge: (currentCache, newPosts) => {
        newPosts.forEach((p) => {
         if (!currentCache.some((c) => c._id === p._id)) {
           currentCache.push(p);
         }
       });
      },

      // ─── Refetch only when page number changes ─────────────
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,

      // Always return an array from the response
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.result)) return response.result;
        if (Array.isArray(response?.posts)) return response.posts;
        return [];
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

      // Optimistically update the post list cache
      async onQueryStarted(postData, { dispatch, queryFulfilled }) {
        try {
          const { data: newPost } = await queryFulfilled;

          dispatch(
            postApi.util.updateQueryData('getPosts', undefined, (draft) => {
              draft.unshift(newPost); // insert new post at top
            })
          );
        } catch (err) {
          console.error('Failed to update post cache:', err);
        }
      },
    }),
  }),
});

export const { useGetPostsQuery, useAddPostMutation } = postApi;
