"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CommentItem from "./CommentItem";
import MediaModal from "./MediaModal";

interface CommentDetailProps {
  post: any;
  onBack?: () => void;
  comments?: any[];
}

const CommentDetail: React.FC<CommentDetailProps> = ({
  post,
  onBack,
  comments = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMedia, setModalMedia] = useState({ url: "", type: "", alt: "" });

  if (!post) return null;

  // Extract post data
  const { id, author, metadata, timestamp, stats, commentOn } = post;

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
  const postComments =
    comments.length > 0
      ? comments
      : [
          {
            id: "comment1",
            author: {
              address: "0x196Fa40f6ffd2a473abf03f6a8D990E6A933A992",
              username: { localName: "truc301297" },
              metadata: {
                picture:
                  "https://ik.imagekit.io/lens/dfea6ed10c136e4524eee518b491f850cbd5a2f3faf0cb70586d2be1a1346b88_10lHD2aF8.webp",
              },
            },
            metadata: { content: "follow back, thanks sir" },
            timestamp: new Date().toISOString(),
            stats: { upvotes: 2, comments: 0 },
            comments: [],
          },
          {
            id: "comment2",
            author: {
              address: "0x5F2b93132F0eb7353432F18dD5B298efd502D9A5",
              username: { localName: "handlefinder" },
              metadata: {
                picture:
                  "https://gw.ipfs-lens.dev/ipfs/QmduqbcDq8joebckykib5poVeV11XDmdAFAwSxRYUAbzcb",
              },
            },
            metadata: { content: "Great post! I'll check out this bot." },
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            stats: { upvotes: 5, comments: 2 },
            comments: [
              {
                id: "comment2-1",
                author: {
                  address: "0x9241a58F5addBfF78E4C5f6a9592d06c5b9B28D4",
                  username: { localName: "cryptouser" },
                  metadata: { picture: "" },
                },
                metadata: {
                  content: "I've been using it for a week, it's amazing!",
                },
                timestamp: new Date(Date.now() - 3000000).toISOString(),
                stats: { upvotes: 1, comments: 1 },
                comments: [
                  {
                    id: "comment2-1-1",
                    author: {
                      address: "0x5F2b93132F0eb7353432F18dD5B298efd502D9A5",
                      username: { localName: "handlefinder" },
                      metadata: {
                        picture:
                          "https://gw.ipfs-lens.dev/ipfs/QmduqbcDq8joebckykib5poVeV11XDmdAFAwSxRYUAbzcb",
                      },
                    },
                    metadata: {
                      content:
                        "Thanks for the feedback! What features do you like most?",
                    },
                    timestamp: new Date(Date.now() - 2000000).toISOString(),
                    stats: { upvotes: 0, comments: 0 },
                    comments: [],
                  },
                ],
              },
              {
                id: "comment2-2",
                author: {
                  address: "0x694200B10F3916C42d2Fab58985583a4e5764C9b",
                  username: { localName: "web3dev" },
                  metadata: { picture: "" },
                },
                metadata: { content: "Is it available on iOS?" },
                timestamp: new Date(Date.now() - 2500000).toISOString(),
                stats: { upvotes: 0, comments: 0 },
                comments: [],
              },
            ],
          },
          {
            id: "comment3",
            author: {
              address: "0x1aBb4F7d77c6CaD78291BD5736D3ddf8d8992c13",
              username: { localName: "cryptoenthusiast" },
              metadata: { picture: "" },
            },
            metadata: {
              content: "Just installed it. Looking forward to trying it out!",
            },
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            stats: { upvotes: 3, comments: 0 },
            comments: [],
          },
        ];

  return (
    <div className="comment-detail bg-black text-white p-4 rounded-md border border-gray-800">
      {/* Header with back button */}
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="mr-2 text-gray-400 hover:text-white"
        >
          <span className="font-mono">cd ..</span>
        </button>
        <h2 className="text-lg font-mono text-red-500">POST_DETAIL</h2>
      </div>

      {/* Original post */}
      <div className="original-post mb-6 border-b border-gray-700 pb-4">
        <div className="flex items-start">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarImage src={profilePicture} alt={username} />
            <AvatarFallback>
              {username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center">
              <div className="font-medium text-red-500">{username}</div>
              <div className="text-gray-500 text-xs ml-2">{formattedDate}</div>
            </div>

            <div className="post-content my-2">
              {metadata?.content || "No content"}
            </div>

            {/* Media content */}
            {mediaUrl && (
              <div className="post-media mb-3">
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
                  </div>
                ) : null}
              </div>
            )}

            {/* Post stats */}
            <div className="post-stats flex text-sm text-gray-500 space-x-4">
              <span>{stats?.upvotes || 0} upvotes</span>
              <span>{stats?.comments || 0} comments</span>
              <span>{stats?.reposts || 0} reposts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comment section header */}
      <div className="comments-header mb-3">
        <div className="flex items-center">
          <span className="font-mono text-green-500 mr-2">$</span>
          <span className="font-mono">ls -la comments/</span>
        </div>
        <div className="text-xs text-gray-500 mt-1 mb-3 font-mono">
          total {postComments.length} items
        </div>
      </div>

      {/* Directory-style comment listing */}
      <div className="comments-container font-mono">
        {postComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

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
