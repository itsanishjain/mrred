"use client";

import React from 'react';

interface PostItemProps {
  post: any;
  isTerminal?: boolean;
}

const PostItem: React.FC<PostItemProps> = ({ post, isTerminal = true }) => {
  if (!post) return null;

  // Extract post data
  const {
    id,
    author,
    metadata,
    timestamp,
    stats,
  } = post;

  // Format date
  const formattedDate = new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Check if post has image
  const hasImage = metadata?.image?.item || 
    (metadata?.attachments?.length > 0 && 
     metadata.attachments[0]?.type?.includes('IMAGE'));
  
  // Check if post has video
  const hasVideo = metadata?.attachments?.length > 0 && 
    metadata.attachments[0]?.type?.includes('VIDEO');
  
  // Get media URL
  const mediaUrl = hasImage 
    ? metadata?.image?.item || metadata?.attachments[0]?.item 
    : hasVideo 
      ? metadata?.attachments[0]?.item 
      : null;

  // Terminal-style rendering
  if (isTerminal) {
    return (
      <div className="post-item mb-4 border-b border-gray-700 pb-3 font-mono text-sm">
        <div className="post-header text-red-500">
          POST_ID: {id ? `${id.substring(0, 10)}...${id.substring(id.length - 10)}` : 'Unknown'}
        </div>
        <div className="post-author">
          AUTHOR: {author?.username?.value || (author?.address && author.address.length > 10 ? author.address.substring(0, 10) + '...' : author?.address) || 'Unknown'}
        </div>
        <div className="post-date">
          TIMESTAMP: {formattedDate}
        </div>
        <div className="post-content mt-2 whitespace-pre-wrap">
          {metadata?.content || 'No content'}
        </div>
        
        {mediaUrl && (
          <div className="post-media mt-2">
            {hasImage ? (
              <div className="text-yellow-500">[IMAGE ATTACHMENT: {mediaUrl.length > 50 ? mediaUrl.substring(0, 50) + '...' : mediaUrl}]</div>
            ) : hasVideo ? (
              <div className="text-yellow-500">[VIDEO ATTACHMENT: {mediaUrl.length > 50 ? mediaUrl.substring(0, 50) + '...' : mediaUrl}]</div>
            ) : null}
          </div>
        )}
        
        <div className="post-stats mt-2 text-gray-400">
          METRICS: {stats?.upvotes || 0} upvotes | {stats?.comments || 0} comments | {stats?.reposts || 0} reposts
        </div>
      </div>
    );
  }
  
  // Regular UI rendering (for non-terminal views)
  return (
    <div className="post-item mb-4 border border-gray-200 rounded-lg p-4 dark:border-gray-700">
      <div className="post-header flex items-center mb-2">
        <div className="font-medium">
          {author?.username?.value || (author?.address && author.address.length > 10 ? author.address.substring(0, 10) + '...' : author?.address) || 'Unknown'}
        </div>
        <div className="text-gray-500 text-sm ml-2">
          {formattedDate}
        </div>
      </div>
      
      <div className="post-content mb-2">
        {metadata?.content || 'No content'}
      </div>
      
      {mediaUrl && (
        <div className="post-media mb-2">
          {hasImage ? (
            <img 
              src={mediaUrl} 
              alt={metadata?.image?.altTag || "Post image"} 
              className="max-w-full h-auto rounded"
            />
          ) : hasVideo ? (
            <video 
              src={mediaUrl} 
              controls 
              className="max-w-full h-auto rounded"
            />
          ) : null}
        </div>
      )}
      
      <div className="post-stats flex text-sm text-gray-500 space-x-4">
        <span>{stats?.upvotes || 0} upvotes</span>
        <span>{stats?.comments || 0} comments</span>
        <span>{stats?.reposts || 0} reposts</span>
      </div>
    </div>
  );
};

export default PostItem;
