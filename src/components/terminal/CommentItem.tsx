"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MediaModal from "./MediaModal";

interface CommentItemProps {
  comment: any;
  depth?: number;
  maxDepth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  depth = 0,
  maxDepth = 5,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMedia, setModalMedia] = useState({ url: "", type: "", alt: "" });
  const [isExpanded, setIsExpanded] = useState(true);

  if (!comment) return null;

  // Extract comment data
  const { id, author, metadata, timestamp } = comment;

  // Format date as relative time
  const formattedDate = formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
  });

  // Get profile picture
  const profilePicture = author?.metadata?.picture || "";
  const username =
    author?.username?.localName ||
    author?.username?.value ||
    (author?.address && author.address.length > 10
      ? author.address.substring(0, 10) + "..."
      : author?.address) ||
    "Unknown";

  // Enhanced media detection (similar to PostItem)
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

  // Directory style indentation
  const indentation = depth * 16;

  // Check if we should render nested comments
  const shouldRenderChildren =
    depth < maxDepth && comment.comments && comment.comments.length > 0;

  return (
    <>
      <div className="comment-item mb-1 font-mono text-sm">
        <div
          className="comment-header flex items-start"
          style={{ paddingLeft: `${indentation}px` }}
        >
          {/* Directory-style icon */}
          <div className="mr-2 flex items-center text-gray-400">
            {depth > 0 && (
              <>
                {Array(depth)
                  .fill(0)
                  .map((_, i) => (
                    <span key={i} className="inline-block w-4">
                      {i === depth - 1 ? "└─" : "│ "}
                    </span>
                  ))}
              </>
            )}
            {shouldRenderChildren ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-white"
              >
                {isExpanded ? "▼" : "►"}
              </button>
            ) : (
              <span className="w-4 inline-block">●</span>
            )}
          </div>

          {/* Avatar */}
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={profilePicture} alt={username} />
            <AvatarFallback>
              {username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Comment content */}
          <div className="flex-1">
            <div className="flex items-center">
              <div className="font-medium text-red-500">{username}</div>
              <div className="text-gray-500 text-xs ml-2">{formattedDate}</div>
            </div>

            <div className="comment-content mb-1 text-white">
              {metadata?.content || "No content"}
            </div>

            {/* Media content */}
            {mediaUrl && (
              <div className="comment-media mb-2">
                {hasImage ? (
                  <div className="media-container">
                    <img
                      src={mediaUrl}
                      alt={metadata?.image?.altTag || "Comment image"}
                      className="max-w-full h-auto max-h-40 rounded shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                      loading="lazy"
                      onClick={() => {
                        setModalMedia({
                          url: mediaUrl,
                          type: "image",
                          alt: metadata?.image?.altTag || "Comment image",
                        });
                        setIsModalOpen(true);
                      }}
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src =
                          "https://via.placeholder.com/400x300?text=Image+Unavailable";
                      }}
                    />
                  </div>
                ) : hasVideo ? (
                  <div className="media-container">
                    <video
                      src={mediaUrl}
                      controls
                      poster={metadata?.asset?.cover?.uri || ""}
                      className="max-w-full h-auto max-h-40 rounded shadow-md cursor-pointer"
                      onClick={() => {
                        setModalMedia({
                          url: mediaUrl,
                          type: "video",
                          alt: "Video content",
                        });
                        setIsModalOpen(true);
                      }}
                    />
                  </div>
                ) : null}
              </div>
            )}

            {/* Comment stats */}
            <div className="comment-stats flex text-xs text-gray-500 space-x-4">
              <span>{comment?.stats?.upvotes || 0} upvotes</span>
              <span>{comment?.stats?.comments || 0} replies</span>
            </div>
          </div>
        </div>

        {/* Nested comments */}
        {isExpanded && shouldRenderChildren && (
          <div className="nested-comments">
            {comment.comments.map((nestedComment: any) => (
              <CommentItem
                key={nestedComment.id}
                comment={nestedComment}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            ))}
          </div>
        )}
      </div>

      {/* Media Modal */}
      <MediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mediaUrl={modalMedia.url}
        mediaType={modalMedia.type}
        altText={modalMedia.alt}
      />
    </>
  );
};

export default CommentItem;
