"use client";

import React from 'react';
import PostItem from './PostItem';

interface PostListProps {
  posts: any[];
  isTerminal?: boolean;
}

const PostList: React.FC<PostListProps> = ({ posts, isTerminal = true }) => {
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
        />
      ))}
    </div>
  );
};

export default PostList;
