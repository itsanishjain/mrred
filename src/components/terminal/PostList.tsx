"use client";

import React from 'react';
import { Paginated, AnyPost } from "@lens-protocol/client";
import PostItem from './PostItem';

interface PostListProps {
  posts: any[];
  isTerminal?: boolean;
  toggleReaction?: (postId: string, isLiked: boolean) => Promise<{ success: boolean; isLiked: boolean }>;
  fetchPostComments?: (postId: string) => Promise<Paginated<AnyPost> | undefined>;
}

const PostList: React.FC<PostListProps> = ({ posts, isTerminal = true, toggleReaction, fetchPostComments }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className={`post-list-empty ${isTerminal ? 'font-mono text-red-500' : 'text-gray-500'}`}>
        {isTerminal ? 'NO POSTS FOUND IN DATABASE.' : 'No posts found.'}
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map((post, index) => (
        <PostItem 
          key={post.id || index} 
          post={post} 
          isTerminal={isTerminal}
          toggleReaction={toggleReaction}
          fetchPostComments={fetchPostComments}
        />
      ))}
    </div>
  );
};

export default PostList;
