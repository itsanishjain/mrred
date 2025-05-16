"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Paginated, AnyPost } from "@lens-protocol/client";
import MediaModal from "./MediaModal";

interface CommentDetailProps {
  post: any;
  onBack?: () => void;
  comments?: any[];
}

const CommentDetail: React.FC<CommentDetailProps> = ({ post, onBack, comments = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMedia, setModalMedia] = useState({ url: "", type: "", alt: "" });

  if (!post) return null;

  // Extract post data
  const { id, author, metadata, timestamp, stats } = post;

  // Format date as relative time
  const formattedDate = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  // Get username
  const username = author?.username?.localName || author?.username?.value || 
    (author?.address && author.address.length > 10
      ? author.address.substring(0, 10) + "..."
      : author?.address) || 
    "Unknown";

  // Enhanced media detection
  const getMediaInfo = () => {
    if (!metadata)
      return {
        hasImage: false,
        hasVideo: false,
        mediaUrl: null,
        mediaType: null,
      };

    // Check for image in various locations
    if (metadata.__typename === "ImageMetadata") {
      return {
        hasImage: true,
        hasVideo: false,
        mediaUrl: metadata.image?.item || metadata.image?.uri || "",
        mediaType: "image",
      };
    }

    // Check for video metadata
    if (metadata.__typename === "VideoMetadata") {
      return {
        hasImage: false,
        hasVideo: true,
        mediaUrl: metadata.asset?.uri || "",
        mediaType: "video",
      };
    }

    // Check direct image property
    if (metadata.image && (metadata.image.item || metadata.image.uri)) {
      return {
        hasImage: true,
        hasVideo: false,
        mediaUrl: metadata.image.item || metadata.image.uri || "",
        mediaType: "image",
      };
    }

    // Check attachments
    if (metadata.attachments && metadata.attachments.length > 0) {
      const attachment = metadata.attachments[0];
      const isImage =
        attachment.type?.includes("IMAGE") ||
        attachment.mimeType?.includes("image") ||
        /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.item || "");
      const isVideo =
        attachment.type?.includes("VIDEO") ||
        attachment.mimeType?.includes("video") ||
        /\.(mp4|webm|ogg|mov)$/i.test(attachment.item || "");

      if (isImage) {
        return {
          hasImage: true,
          hasVideo: false,
          mediaUrl: attachment.item || attachment.uri || "",
          mediaType: "image",
        };
      }

      if (isVideo) {
        return {
          hasImage: false,
          hasVideo: true,
          mediaUrl: attachment.item || attachment.uri || "",
          mediaType: "video",
        };
      }
    }

    return {
      hasImage: false,
      hasVideo: false,
      mediaUrl: null,
      mediaType: null,
    };
  };

  // Get media information
  const { hasImage, hasVideo, mediaUrl, mediaType } = getMediaInfo();
  
  // Use provided comments or fallback to empty array
  const postComments = comments.length > 0 ? comments : [];

  return (
    <div className="mb-4 font-mono text-sm">
      <pre className="text-white">
        <code>
          <span className="text-red-500">MR.RED:~ $</span> <span className="text-green-500">cat post_{id.substring(0, 8)}.txt</span>
          
          <div className="mt-2 border-l-2 border-red-500 pl-2">
            <span className="text-red-500">AUTHOR:</span> <span className="text-white">{username}</span> <span className="text-gray-500">({formattedDate})</span>
            <div className="mt-1 text-white">{metadata?.content || "No content"}</div>
            
            {mediaUrl && (
              <div className="mt-1">
                {hasImage ? (
                  <span 
                    className="text-yellow-500 cursor-pointer hover:text-yellow-300"
                    onClick={() => {
                      setModalMedia({
                        url: mediaUrl,
                        type: "image",
                        alt: metadata?.image?.altTag || "Post image",
                      });
                      setIsModalOpen(true);
                    }}
                  >
                    [IMAGE_ATTACHMENT] {metadata?.image?.altTag || ""}
                  </span>
                ) : hasVideo ? (
                  <span 
                    className="text-yellow-500 cursor-pointer hover:text-yellow-300"
                    onClick={() => {
                      setModalMedia({
                        url: mediaUrl,
                        type: "video",
                        alt: "Video content",
                      });
                      setIsModalOpen(true);
                    }}
                  >
                    [VIDEO_ATTACHMENT]
                  </span>
                ) : null}
              </div>
            )}
            
            <div className="mt-1 text-gray-500">
              {stats?.upvotes || 0} upvotes | {stats?.comments || 0} comments | {stats?.reposts || 0} reposts
            </div>
          </div>
          
          <div className="mt-4">
            <span className="text-red-500">MR.RED:~ $</span> <span className="text-green-500">find ./comments -type f | sort</span>
            
            <div className="mt-2">
              {postComments.length === 0 ? (
                <span className="text-gray-500">No comments found.</span>
              ) : (
                postComments.map((comment, index) => {
                  const commentUsername = comment.author?.username?.localName || 
                    comment.author?.username?.value || 
                    (comment.author?.address && comment.author.address.length > 10
                      ? comment.author.address.substring(0, 10) + "..."
                      : comment.author?.address) || 
                    "Unknown";
                  
                  const commentDate = formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true });
                  
                  return (
                    <div key={comment.id} className="mb-2">
                      <div className="text-yellow-500">./comments/{index + 1}_comment_{comment.id.substring(0, 6)}.txt</div>
                      <div className="pl-4 border-l border-gray-700">
                        <span className="text-red-500">{commentUsername}</span> <span className="text-gray-500">({commentDate})</span>
                        <div className="text-white">{comment.metadata?.content || "No content"}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <span className="text-red-500">MR.RED:~ $</span> <span className="cursor-pointer text-green-500 hover:underline" onClick={onBack}>cd ..</span>
          </div>
        </code>
      </pre>
      
      {/* Media Modal */}
      <MediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mediaUrl={modalMedia.url}
        mediaType={modalMedia.type}
        altText={modalMedia.alt}
      />
    </div>
  );
};

export default CommentDetail;
