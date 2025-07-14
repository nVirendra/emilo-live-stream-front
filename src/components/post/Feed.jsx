import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetPostsQuery } from '../../features/api/post.api';
import PostCard from '../post/PostCard';
import CreatePost from '../../pages/post/CreatePost';

const Feed = () => {
  const user = useSelector((state) => state.auth.user);
  const {
    data: rawPosts = [],       // now guaranteed array
    isLoading,
    isError,
    error,
  } = useGetPostsQuery();

  // Convert raw → UI-friendly shape
  const posts = useMemo(
    () =>
      rawPosts.map((post) => ({
        id: post._id,
        user: post.userId?.name ?? 'Unknown User',
        userId: post.userId?._id ?? '',
        content: post.content,
        image: post.mediaType === 'image' ? post.mediaUrl : '',
        video: post.mediaType === 'video' ? post.mediaUrl : '',
        likes: post.likes.length,
        liked: post.likes.includes(user?._id),
        comments: post.comments.map((c) => ({
          name: c.userId?.name ?? 'User',
          comment: c.comment,
        })),
        privacy: post.privacy,
        createdAt: post.createdAt,
      })),
    [rawPosts, user?._id]
  );

  if (isLoading) return <p>Loading…</p>;
  if (isError)   return <p>Error: {error?.data?.message || 'Failed to load feed'}</p>;

  return (
    <section className="space-y-6">
      <CreatePost />
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
};

export default Feed;
