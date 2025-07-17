import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useGetPostsQuery } from '../../features/api/post.api';
import PostCard from '../post/PostCard';
import CreatePost from '../../pages/post/CreatePost';

const LIMIT = 2;

const Feed = () => {
  const user = useSelector((state) => state.auth.user);
  const [page, setPage] = useState(1);
  const loaderRef = useRef();

  const {
    data: rawPosts = [],
    isFetching,
    isError,
    error,
  } = useGetPostsQuery({ page, limit: LIMIT });

  // Infinite Scroll Handler
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && !isFetching) {
        setPage((prev) => prev + 1);
      }
    },
    [isFetching]
  );

  useEffect(() => {
    const option = { root: null, rootMargin: '20px', threshold: 1.0 };
    const observer = new IntersectionObserver(handleObserver, option);
    const currentLoader = loaderRef.current;

    if (currentLoader) observer.observe(currentLoader);
    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [handleObserver]);

  // Transform posts for display
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

  if (isError) {
    return <p className="text-red-500 text-center">{error?.data?.message || 'Failed to load feed'}</p>;
  }

  return (
    <section className="space-y-6">
      <CreatePost />
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {/* Infinite scroll loader div */}
      <div ref={loaderRef} className="h-10 flex items-center justify-center">
        {isFetching && <div className="loader" />}
      </div>
    </section>
  );
};

export default Feed;
