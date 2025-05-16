"use client";

import React, { useState } from "react";
import { Paginated, AnyPost } from "@lens-protocol/client";
import MediaModal from "./MediaModal";
import CommentDetail from "./CommentDetail";

interface PostItemProps {
  post: any;
  isTerminal?: boolean;
  toggleReaction?: (
    postId: string,
    isLiked: boolean
  ) => Promise<{ success: boolean; isLiked: boolean }>;
  fetchPostComments?: (
    postId: string
  ) => Promise<Paginated<AnyPost> | undefined>;
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  isTerminal = true,
  toggleReaction,
  fetchPostComments,
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.stats?.upvotes || 0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMedia, setModalMedia] = useState({ url: "", type: "", alt: "" });
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  if (!post) return null;

  // Extract post data
  const { id, author, metadata, timestamp, stats } = post;

  // Format date
  const formattedDate = new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

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

    // Check for media array
    if (metadata.media && metadata.media.length > 0) {
      const media = metadata.media[0];
      const isImage =
        media.mimeType?.includes("image") ||
        /\.(jpg|jpeg|png|gif|webp)$/i.test(media.url || "");
      const isVideo =
        media.mimeType?.includes("video") ||
        /\.(mp4|webm|ogg|mov)$/i.test(media.url || "");

      if (isImage) {
        return {
          hasImage: true,
          hasVideo: false,
          mediaUrl: media.url || media.uri || "",
          mediaType: "image",
        };
      }

      if (isVideo) {
        return {
          hasImage: false,
          hasVideo: true,
          mediaUrl: media.url || media.uri || "",
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

  // Handle viewing comments
  const handleViewComments = async () => {
    if (!fetchPostComments || !post.id) return;

    setIsLoadingComments(true);
    try {
      const result = await fetchPostComments(post.id);

      // Process the result to extract comments
      if (result) {
        // Handle Lens Protocol Paginated response format
        // Convert readonly array to regular array with spread operator
        const commentsData = [...(result.items || [])];
        setComments(commentsData);
        console.log("Fetched comments:", commentsData);
      } else {
        // Handle undefined result
        console.log("No comments found");
        setComments([]);
      }

      setShowComments(true);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Render the appropriate view with the modal
  return (
    <>
      {showComments ? (
        <CommentDetail
          post={post}
          comments={comments}
          onBack={() => setShowComments(false)}
        />
      ) : isTerminal ? (
        <div className="post-item mb-4 border-b border-gray-700 pb-3 font-mono text-sm">
          <div className="post-header text-red-500">
            POST_ID:{" "}
            {id
              ? `${id.substring(0, 10)}...${id.substring(id.length - 10)}`
              : "Unknown"}
          </div>
          <div className="post-author">
            AUTHOR:{" "}
            {author?.username?.value ||
              (author?.address && author.address.length > 10
                ? author.address.substring(0, 10) + "..."
                : author?.address) ||
              "Unknown"}
          </div>
          <div className="post-date">TIMESTAMP: {formattedDate}</div>
          <div className="post-content mt-2 whitespace-pre-wrap">
            {metadata?.content || "No content"}
          </div>

          {mediaUrl && (
            <div className="post-media mt-2">
              {hasImage ? (
                <div>
                  <div className="text-yellow-500 mb-2">[IMAGE ATTACHMENT]</div>
                  <img
                    src={mediaUrl}
                    alt={metadata?.image?.altTag || "Post image"}
                    className="max-w-full max-h-64 rounded border border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                    loading="lazy"
                    onClick={() => {
                      setModalMedia({
                        url: mediaUrl,
                        type: "image",
                        alt: metadata?.image?.altTag || "Post image",
                      });
                      setIsModalOpen(true);
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src =
                        "https://via.placeholder.com/400x300?text=Image+Unavailable";
                    }}
                  />
                </div>
              ) : hasVideo ? (
                <div>
                  <div className="text-yellow-500 mb-2">[VIDEO ATTACHMENT]</div>
                  <video
                    src={mediaUrl}
                    controls
                    poster={metadata?.asset?.cover?.uri || ""}
                    className="max-w-full max-h-64 rounded border border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
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
              ) : mediaType ? (
                <div className="text-yellow-500">
                  [MEDIA ATTACHMENT: {mediaType.toUpperCase()}]
                </div>
              ) : null}
            </div>
          )}

          <div className="post-stats mt-2 text-gray-400">
            METRICS:
            {toggleReaction ? (
              <button
                onClick={async () => {
                  if (isLiking) return;
                  setIsLiking(true);
                  try {
                    const result = await toggleReaction(id, isLiked);
                    if (result.success) {
                      // Update UI state
                      setIsLiked(result.isLiked);
                      // Update like count
                      setLikeCount((prev: number) =>
                        result.isLiked ? prev + 1 : Math.max(0, prev - 1)
                      );
                    }
                  } catch (error) {
                    console.error("Error toggling reaction:", error);
                  } finally {
                    setIsLiking(false);
                  }
                }}
                disabled={isLiking}
                className={`inline-flex items-center ${
                  isLiking
                    ? "opacity-50"
                    : isLiked
                    ? "text-red-500 hover:text-gray-400"
                    : "hover:text-red-500"
                } transition-colors mr-1`}
              >
                <span className="mr-1">
                  [{isLiking ? "PROCESSING..." : isLiked ? "UNLIKE" : "LIKE"}]
                </span>{" "}
                {likeCount}
              </button>
            ) : (
              <span>{stats?.upvotes || 0} upvotes</span>
            )}{" "}
            | {stats?.comments || 0} comments | {stats?.reposts || 0} reposts
          </div>
        </div>
      ) : (
        <div className="post-item mb-4 border border-gray-200 rounded-lg p-4 dark:border-gray-700">
          <div className="post-header flex items-center mb-2">
            <div className="font-medium">
              {author?.username?.value ||
                (author?.address && author.address.length > 10
                  ? author.address.substring(0, 10) + "..."
                  : author?.address) ||
                "Unknown"}
            </div>
            <div className="text-gray-500 text-sm ml-2">{formattedDate}</div>
          </div>

          <div className="post-content mb-2">
            {metadata?.content || "No content"}
          </div>

          {mediaUrl && (
            <div className="post-media mb-2">
              {hasImage ? (
                <div className="media-container">
                  <img
                    src={mediaUrl}
                    alt={metadata?.image?.altTag || "Post image"}
                    className="max-w-full h-auto rounded shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    loading="lazy"
                    onClick={() => {
                      setModalMedia({
                        url: mediaUrl,
                        type: "image",
                        alt: metadata?.image?.altTag || "Post image",
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
                  {metadata?.image?.altTag && (
                    <div className="text-sm text-gray-500 mt-1">
                      {metadata.image.altTag}
                    </div>
                  )}
                </div>
              ) : hasVideo ? (
                <div className="media-container">
                  <video
                    src={mediaUrl}
                    controls
                    poster={metadata?.asset?.cover?.uri || ""}
                    className="max-w-full h-auto rounded shadow-md cursor-pointer"
                    onClick={() => {
                      setModalMedia({
                        url: mediaUrl,
                        type: "video",
                        alt: "Video content",
                      });
                      setIsModalOpen(true);
                    }}
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Video content
                  </div>
                </div>
              ) : mediaType ? (
                <div className="p-4 border border-gray-200 rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-blue-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Media attachment: {mediaType}</span>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <div className="post-stats flex text-sm text-gray-500 space-x-4">
            <span>{stats?.upvotes || 0} upvotes</span>
            <span
              className="cursor-pointer hover:text-white transition-colors"
              onClick={handleViewComments}
            >
              {isLoadingComments
                ? "Loading..."
                : `${stats?.comments || 0} comments`}
            </span>
            <span>{stats?.reposts || 0} reposts</span>
          </div>
        </div>
      )}

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

export default PostItem;
