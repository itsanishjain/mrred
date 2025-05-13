"use client";

import React, { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { useAccount } from "wagmi";
import TypingText from "./TypingText";
import MenuOption from "./MenuOption";
import PostList from "./PostList";
import MediaUploadModal from "./MediaUploadModal";
import { Ok, UnexpectedError } from "@lens-protocol/client";
import { Paginated, AnyPost } from "@lens-protocol/client";
import { useToast } from "@/hooks/use-toast";
import { MediaImageMimeType } from "@lens-protocol/metadata";

interface TerminalProps {
  createTextPost?: ({ postContent }: { postContent: string }) => Promise<void>;
  createImagePost?: ({
    postContent,
    imageData,
  }: {
    postContent: string;
    imageData: {
      file: File;
      altTag: string;
      mimeType: MediaImageMimeType;
    };
  }) => Promise<void>;
  fetchUserPosts?: () => Promise<void | Ok<
    Paginated<AnyPost>,
    UnexpectedError
  >>;
  fetchUserFeed?: (
    cursor?: string | null
  ) => Promise<void | Ok<Paginated<any>, UnexpectedError>>;
  likePost?: (postId: string) => Promise<boolean>;
  toggleReaction?: (postId: string, isLiked: boolean) => Promise<{ success: boolean; isLiked: boolean }>;
}

interface PostData {
  id: string;
  author: {
    address?: string;
    username?: {
      value?: string;
    };
  };
  metadata?: {
    content?: string;
    image?: {
      item?: string;
      altTag?: string | null;
    };
    attachments?: Array<{
      type?: string;
      item?: string;
    }>;
  };
  timestamp: string;
  stats?: {
    upvotes?: number;
    comments?: number;
    reposts?: number;
  };
}

const Terminal: React.FC<TerminalProps> = ({
  createTextPost,
  createImagePost,
  fetchUserPosts,
  fetchUserFeed,
  toggleReaction,
}) => {
  const [showIntro1, setShowIntro1] = useState(true);
  const [showIntro2, setShowIntro2] = useState(false);
  const [showIntro3, setShowIntro3] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [poweringUp, setPoweringUp] = useState(true);
  const [commandMode, setCommandMode] = useState(false);
  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [commandOutput, setCommandOutput] = useState<string>("");
  const [fetchedPosts, setFetchedPosts] = useState<PostData[]>([]);
  const [showPosts, setShowPosts] = useState(false);
  const [processingCommand, setProcessingCommand] = useState(false);
  const [showMediaUploadModal, setShowMediaUploadModal] = useState(false);
  const [pendingPostContent, setPendingPostContent] = useState("");
  const [nextFeedCursor, setNextFeedCursor] = useState<string | null>(null);
  const [hasMoreFeedPosts, setHasMoreFeedPosts] = useState(false);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get wallet connection status
  const { isConnected, address } = useAccount();

  const { toast } = useToast();

  const typewriterSound = new Howl({
    src: ["/assets/typewriter.wav"],
    sprite: {
      type: [0, 100],
    },
  });

  useEffect(() => {
    setTimeout(() => {
      setPoweringUp(false);
    }, 1000);
  }, []);

  const intro1Completed = () => {
    setShowIntro2(true);
  };

  const intro2Completed = () => {
    setShowIntro3(true);
  };

  const intro3Completed = () => {
    setTimeout(() => {
      setShowOptions(true);
    }, 500);
  };

  const handleOptionClick = (option: string) => {
    console.log(`PROCESSING REQUEST: ${option.toUpperCase()}`);

    if (option === "command_line") {
      // Enter command line mode
      setCommandMode(true);

      // Show available commands when entering command mode
      const commandsHelp =
        "Available commands:\n" +
        Object.entries(availableCommands)
          .map(([cmd, desc]) => `  ${cmd.padEnd(15)} - ${desc}`)
          .join("\n");

      setCommandHistory([]);
      setCommandOutput(commandsHelp);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Available commands
  const availableCommands = {
    help: "Display available commands",
    ls: "List available options",
    clear: "Clear the terminal",
    "fetch-posts": "Fetch your posts",
    "create-post": "Create a new post (Usage: create-post <your post content>)",
    "create-post --media":
      "Create a post with an image (Usage: create-post --media <your post content>)",
    "fetch-feed": "Fetch your personalized feed",
    "load-more-feed": "Load more posts from your feed",
    exit: "Exit command mode",
  };

  // Mock data for testing - remove in production
  const samplePost = {
    id: "68823665970495445097518222922132319050094952959899120707583022726017483112888",
    author: {
      address: "0x754A315d7cdf7b6014f193E439B59db3aF520613",
      username: {
        value: "lens/ngmisl",
      },
    },
    metadata: {
      content: "Gm",
      image: {
        item: "https://ik.imagekit.io/lens/5c9e1c5a4297febe5737d88fe6d6260b404fc489cf0c3d2abe56d39c4a2cf639_AD--x4FuU.jpeg",
        altTag: null,
      },
    },
    timestamp: "2025-05-10T06:54:16+00:00",
    stats: {
      upvotes: 150,
      comments: 72,
      reposts: 34,
    },
  };

  const executeCommand = async (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    let output = "";

    // Add command to history
    setCommandHistory((prev) => [...prev, `> ${command}`]);

    // Reset post view state (except for load-more-feed command)
    if (command !== "load-more-feed") {
      setShowPosts(false);
      setFetchedPosts([]);
    }

    // Set processing state
    setProcessingCommand(true);

    try {
      // Process command
      switch (command) {
        case "help":
          output =
            "Available commands:\n" +
            Object.entries(availableCommands)
              .map(([cmd, desc]) => `  ${cmd.padEnd(15)} - ${desc}`)
              .join("\n");
          break;
        case "ls":
          output =
            "Available options:\n" +
            "  consume_propaganda - Access your daily dose of approved information\n" +
            "  report_dissidence - Report unauthorized thoughts and behavior\n" +
            "  social_compliance - View your social credit score\n" +
            "  request_permission - Submit requests for basic human privileges";
          break;
        case "clear":
          setCommandHistory([]);
          setCommandOutput("");
          setProcessingCommand(false);
          return;

        case "fetch-feed":
          if (fetchUserFeed) {
            // Reset pagination state when fetching new feed
            setNextFeedCursor(null);
            setHasMoreFeedPosts(false);

            setCommandOutput(
              "FETCHING YOUR FEED...\nPlease wait while we retrieve your feed."
            );
            try {
              const feedResult = await fetchUserFeed();

              // Debug log the raw feed result
              console.log("Feed result:", feedResult);

              if (feedResult && "isOk" in feedResult && feedResult.isOk()) {
                // Debug log the items
                console.log("Feed items:", feedResult.value.items);
                // Store pagination info
                const pageInfo = feedResult.value.pageInfo;
                setNextFeedCursor(pageInfo.next);
                setHasMoreFeedPosts(!!pageInfo.next);

                // Log the feed items structure for debugging
                if (feedResult.value.items.length > 0) {
                  console.log(
                    "First feed item type:",
                    feedResult.value.items[0].__typename
                  );
                }

                // Map feed items to PostData format
                const mappedPosts = feedResult.value.items.map((item: any) => {
                  // Check if this is a PostForYou type and unwrap the post
                  const post =
                    item.__typename === "PostForYou" ? item.post : item;
                  // Initialize variables for post data
                  let content = "";
                  let imageUrl = "";
                  let imageAlt = null;
                  let timestamp = "";
                  let authorAddress = "";
                  let authorUsername = "";
                  let upvotes = 0;
                  let comments = 0;
                  let reposts = 0;

                  // Extract post ID
                  const id = post.id;

                  // Extract author information
                  if (post.author) {
                    const author = post.author;
                    authorAddress = author.address || "";

                    if (author.username) {
                      authorUsername =
                        author.username.value ||
                        author.username.localName ||
                        "";
                    }
                  }

                  // Extract timestamp
                  if (post.timestamp) {
                    timestamp = post.timestamp;
                  }

                  // Extract stats
                  if (post.stats) {
                    const stats = post.stats;
                    upvotes = stats.upvotes || 0;
                    comments = stats.comments || 0;
                    reposts = stats.reposts || 0;
                  }

                  // Extract content and media
                  if (post.metadata) {
                    const metadata = post.metadata;

                    // Get content based on metadata type
                    if (metadata.content) {
                      content = metadata.content;
                    }

                    // Get image if available
                    if (
                      metadata.__typename === "ImageMetadata" &&
                      metadata.image
                    ) {
                      const image = metadata.image;
                      if (image.item) {
                        imageUrl = image.item || "";
                      }
                      imageAlt = image.altTag || null;
                    }
                  }

                  // Create PostData object
                  return {
                    id,
                    author: {
                      address: authorAddress,
                      username: { value: authorUsername },
                    },
                    metadata: {
                      content,
                      image: imageUrl
                        ? { item: imageUrl, altTag: imageAlt }
                        : undefined,
                    },
                    timestamp,
                    stats: { upvotes, comments, reposts },
                  } as PostData;
                });

                // Filter out any undefined or invalid posts
                const validPosts = mappedPosts.filter(
                  (post) => post.id && post.timestamp
                );

                // Update state with valid mapped posts
                setFetchedPosts(validPosts);
                setShowPosts(true);
                output =
                  validPosts.length > 0
                    ? `YOUR FEED HAS BEEN RETRIEVED: ${
                        validPosts.length
                      } POSTS${
                        hasMoreFeedPosts
                          ? " (MORE AVAILABLE - USE load-more-feed COMMAND)"
                          : ""
                      }`
                    : "NO VALID POSTS FOUND IN FEED.";
              } else {
                output = "FEED RETRIEVAL FAILED";
              }
              // Remove mock data since we're now using real data
            } catch (error) {
              output = `ERROR IN FEED RETRIEVAL: ${
                error instanceof Error ? error.message : "Unknown error"
              }`;
            }
          } else {
            output = "FEED RETRIEVAL FUNCTION NOT AVAILABLE";
          }
          break;

        case "load-more-feed":
          if (fetchUserFeed && nextFeedCursor && hasMoreFeedPosts) {
            // Don't reset post view state for load-more-feed
            setShowPosts(true);
            setFetchedPosts((prev) => prev); // Keep existing posts
            setIsLoadingMorePosts(true);

            setCommandOutput(
              "LOADING MORE POSTS...\nPlease wait while we retrieve additional posts."
            );

            try {
              const feedResult = await fetchUserFeed(nextFeedCursor);

              if (feedResult && "isOk" in feedResult && feedResult.isOk()) {
                // Update pagination info
                const pageInfo = feedResult.value.pageInfo;
                setNextFeedCursor(pageInfo.next);
                setHasMoreFeedPosts(!!pageInfo.next);

                // Log the feed items structure for debugging
                if (feedResult.value.items.length > 0) {
                  console.log(
                    "First feed item type:",
                    feedResult.value.items[0].__typename
                  );
                }

                // Map feed items to PostData format
                const mappedPosts = feedResult.value.items.map((item: any) => {
                  // Check if this is a PostForYou type and unwrap the post
                  const post =
                    item.__typename === "PostForYou" ? item.post : item;
                  // Initialize variables for post data
                  let content = "";
                  let imageUrl = "";
                  let imageAlt = null;
                  let timestamp = "";
                  let authorAddress = "";
                  let authorUsername = "";
                  let upvotes = 0;
                  let comments = 0;
                  let reposts = 0;

                  // Extract post ID
                  const id = post.id;

                  // Extract author information
                  if (post.author) {
                    const author = post.author;
                    authorAddress = author.address || "";

                    if (author.username) {
                      authorUsername =
                        author.username.value ||
                        author.username.localName ||
                        "";
                    }
                  }

                  // Extract timestamp
                  if (post.timestamp) {
                    timestamp = post.timestamp;
                  }

                  // Extract stats
                  if (post.stats) {
                    const stats = post.stats;
                    upvotes = stats.upvotes || 0;
                    comments = stats.comments || 0;
                    reposts = stats.reposts || 0;
                  }

                  // Extract content and media
                  if (post.metadata) {
                    const metadata = post.metadata;

                    // Get content based on metadata type
                    if (metadata.content) {
                      content = metadata.content;
                    }

                    // Get image if available
                    if (
                      metadata.__typename === "ImageMetadata" &&
                      metadata.image
                    ) {
                      const image = metadata.image;
                      if (image.item) {
                        imageUrl = image.item || "";
                      }
                      imageAlt = image.altTag || null;
                    }
                  }

                  // Create PostData object
                  return {
                    id,
                    author: {
                      address: authorAddress,
                      username: { value: authorUsername },
                    },
                    metadata: {
                      content,
                      image: imageUrl
                        ? { item: imageUrl, altTag: imageAlt }
                        : undefined,
                    },
                    timestamp,
                    stats: { upvotes, comments, reposts },
                  } as PostData;
                });

                // Filter out any undefined or invalid posts
                const validPosts = mappedPosts.filter(
                  (post) => post.id && post.timestamp
                );

                // Append new posts to existing posts
                setFetchedPosts((prevPosts) => [...prevPosts, ...validPosts]);
                setShowPosts(true);

                // Add to command history instead of replacing output
                setCommandHistory((prev) => [
                  ...prev,
                  `LOADED ${validPosts.length} MORE POSTS${
                    hasMoreFeedPosts
                      ? " (MORE AVAILABLE - USE load-more-feed COMMAND)"
                      : ""
                  }`,
                ]);

                output =
                  validPosts.length > 0
                    ? `LOADED ${validPosts.length} MORE POSTS${
                        hasMoreFeedPosts ? " (MORE AVAILABLE)" : ""
                      }`
                    : "NO ADDITIONAL POSTS FOUND.";
              } else {
                output = "FAILED TO LOAD MORE POSTS";
              }
            } catch (error) {
              output = `ERROR LOADING MORE POSTS: ${
                error instanceof Error ? error.message : "Unknown error"
              }`;
            } finally {
              setIsLoadingMorePosts(false);
            }
          } else if (!nextFeedCursor || !hasMoreFeedPosts) {
            output = "NO MORE POSTS AVAILABLE TO LOAD";
          } else {
            output = "LOAD MORE FUNCTION NOT AVAILABLE OR FEED NOT LOADED YET";
          }
          break;

        case command.startsWith("create-post") ? command : "":
          // Check if the command includes the --media flag
          const hasMediaFlag = command.includes("--media");

          // Extract post content, handling the --media flag if present
          let postContent = "";
          if (hasMediaFlag) {
            postContent = cmd
              .replace("create-post", "")
              .replace("--media", "")
              .trim();
          } else {
            postContent = cmd.substring("create-post".length).trim();
          }

          if (!postContent) {
            output = hasMediaFlag
              ? "ERROR: Post content is required. Usage: create-post --media <your post content>"
              : "ERROR: Post content is required. Usage: create-post <your post content>";
            break;
          }

          if (hasMediaFlag && createImagePost) {
            // Store the content and show the media upload modal
            setPendingPostContent(postContent);
            setShowMediaUploadModal(true);
            output =
              "MEDIA UPLOAD INTERFACE ACTIVATED\nPlease select an image to upload.";
          } else if (!hasMediaFlag && createTextPost) {
            setCommandOutput(
              `CREATING NEW POST...\nPost content: "${postContent}"\nPlease wait while we process your request.`
            );

            try {
              await createTextPost({
                postContent: postContent,
              });
              output =
                "POST CREATION SUCCESSFUL!\nYour thoughts have been permanently recorded in the digital realm.";
            } catch (error) {
              output = `POST CREATION FAILED: ${
                error instanceof Error ? error.message : "Unknown error"
              }`;
            }
          } else {
            output =
              "POST CREATION INTERFACE:\n" +
              "ERROR: Creation function not available. Please connect your wallet first.";
          }
          break;

        case "fetch-posts":
          if (fetchUserPosts) {
            setCommandOutput(
              "FETCHING YOUR POSTS...\nPlease wait while we retrieve your posts."
            );
            try {
              const postsResult = await fetchUserPosts();

              if (postsResult && "isOk" in postsResult && postsResult.isOk()) {
                // Map feed items to PostData format
                const mappedPosts = postsResult.value.items.map((post: any) => {
                  // Initialize variables for post data
                  let content = "";
                  let imageUrl = "";
                  let imageAlt = null;
                  let timestamp = "";
                  let authorAddress = "";
                  let authorUsername = "";
                  let upvotes = 0;
                  let comments = 0;
                  let reposts = 0;

                  // Extract post ID
                  const id = post.id;

                  // Extract author information
                  if (post.author) {
                    const author = post.author;
                    authorAddress = author.address || "";

                    if (author.username) {
                      authorUsername =
                        author.username.value ||
                        author.username.localName ||
                        "";
                    }
                  }

                  // Extract timestamp
                  if (post.timestamp) {
                    timestamp = post.timestamp;
                  }

                  // Extract stats
                  if (post.stats) {
                    const stats = post.stats;
                    upvotes = stats.upvotes || 0;
                    comments = stats.comments || 0;
                    reposts = stats.reposts || 0;
                  }

                  // Extract content and media
                  if (post.metadata) {
                    const metadata = post.metadata;

                    // Get content based on metadata type
                    if (metadata.content) {
                      content = metadata.content;
                    }

                    // Get image if available
                    if (
                      metadata.__typename === "ImageMetadata" &&
                      metadata.image
                    ) {
                      const image = metadata.image;
                      if (image.item) {
                        imageUrl = image.item || "";
                      }
                      imageAlt = image.altTag || null;
                    }
                  }

                  // Create PostData object
                  return {
                    id,
                    author: {
                      address: authorAddress,
                      username: { value: authorUsername },
                    },
                    metadata: {
                      content,
                      image: imageUrl
                        ? { item: imageUrl, altTag: imageAlt }
                        : undefined,
                    },
                    timestamp,
                    stats: { upvotes, comments, reposts },
                  } as PostData;
                });

                // Filter out any undefined or invalid posts
                const validPosts = mappedPosts.filter(
                  (post) => post.id && post.timestamp
                );

                // Update state with valid mapped posts
                setFetchedPosts(validPosts);
                setShowPosts(true);
                output =
                  validPosts.length > 0
                    ? "YOUR POSTS HAVE BEEN RETRIEVED:"
                    : "NO VALID POSTS FOUND.";
              } else {
                output = "POST RETRIEVAL FAILED";
              }
              // Remove mock data since we're now using real data
            } catch (error) {
              output = `ERROR IN POST RETRIEVAL: ${
                error instanceof Error ? error.message : "Unknown error"
              }`;
            }
          } else {
            output =
              "FETCHING YOUR POSTS...\n" +
              "ERROR: Post retrieval function not available. Please connect your wallet first.";
          }
          break;

        case "fetch-feed":
          if (fetchUserFeed) {
            setCommandOutput(
              "FETCHING PERSONALIZED FEED...\nPlease wait while we analyze your digital footprint."
            );
            try {
              // Call the fetchUserFeed function to get the user's feed
              const feedResult = await fetchUserFeed();

              // Handle case where no result is returned
              if (!feedResult) {
                output = "FEED RETRIEVAL FAILED: No feed data returned";
                toast({
                  title: "Feed fetching failed",
                  description: "No feed data available",
                  variant: "destructive",
                });
                break;
              }

              // Handle error case
              if ("isErr" in feedResult && feedResult.isErr()) {
                output = `FEED RETRIEVAL FAILED: ${
                  feedResult.error.message || "Unknown error"
                }`;
                toast({
                  title: "Feed fetching failed",
                  description:
                    feedResult.error.message || "Please try again later",
                  variant: "destructive",
                });
                break;
              }

              // Process successful result
              if ("isOk" in feedResult && feedResult.isOk()) {
                // Map feed items to PostData format
                const mappedPosts = feedResult.value.items.map((feedItem) => {
                  // Initialize variables for post data
                  let content = "";
                  let imageUrl = "";
                  let imageAlt = null;
                  let timestamp = "";
                  let authorAddress = "";
                  let authorUsername = "";
                  let upvotes = 0;
                  let comments = 0;
                  let reposts = 0;

                  // For PostForYou type, extract the actual post
                  const post =
                    feedItem.__typename === "PostForYou"
                      ? feedItem.post
                      : feedItem;

                  // Extract post ID
                  const id = post.id;

                  // Extract author information
                  if (post.author) {
                    const author = post.author;
                    authorAddress = author.address || "";

                    if (author.username) {
                      authorUsername =
                        author.username.value ||
                        author.username.localName ||
                        "";
                    }
                  }

                  // Extract timestamp
                  if (post.timestamp) {
                    timestamp = post.timestamp;
                  }

                  // Extract stats
                  if (post.stats) {
                    const stats = post.stats;
                    upvotes = stats.upvotes || 0;
                    comments = stats.comments || 0;
                    reposts = stats.reposts || 0;
                  }

                  // Extract content and media
                  if (post.metadata) {
                    const metadata = post.metadata;

                    // Get content based on metadata type
                    if (metadata.content) {
                      content = metadata.content;
                    }

                    // Get image if available
                    if (
                      metadata.__typename === "ImageMetadata" &&
                      metadata.image
                    ) {
                      const image = metadata.image;
                      if (image.item) {
                        imageUrl = image.item || "";
                      }
                      imageAlt = image.altTag || null;
                    }
                  }

                  // Create PostData object
                  return {
                    id,
                    author: {
                      address: authorAddress,
                      username: { value: authorUsername },
                    },
                    metadata: {
                      content,
                      image: imageUrl
                        ? { item: imageUrl, altTag: imageAlt }
                        : undefined,
                    },
                    timestamp,
                    stats: { upvotes, comments, reposts },
                  } as PostData;
                });

                // Filter out any undefined or invalid posts
                const validPosts = mappedPosts.filter(
                  (post) => post.id && post.timestamp
                );

                // Update state with valid mapped posts
                setFetchedPosts(validPosts);
                setShowPosts(true);
                output =
                  validPosts.length > 0
                    ? "YOUR PERSONALIZED FEED HAS BEEN RETRIEVED:"
                    : "NO VALID POSTS FOUND IN YOUR FEED.";
              } else {
                output = "FEED RETRIEVAL FAILED: Invalid response format";
              }
            } catch (error) {
              // Handle any unexpected errors
              output = `FEED RETRIEVAL ERROR: ${
                error instanceof Error ? error.message : "Unknown error"
              }`;
              toast({
                title: "Feed fetching failed",
                description: "An unexpected error occurred",
                variant: "destructive",
              });
            }
          } else {
            // Handle case where fetchUserFeed function is not available
            output =
              "FETCHING APPROVED CONTENT FEED...\nERROR: Feed function not available. Please connect your wallet first.";
          }
          break;

        case "exit":
          setCommandMode(false);
          setProcessingCommand(false);
          return;

        default:
          output = `COMMAND NOT RECOGNIZED: ${command}\nType 'help' for available commands.`;
      }
    } catch (error) {
      output = `SYSTEM ERROR: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    } finally {
      setCommandOutput(output);
      setProcessingCommand(false);
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim()) {
      executeCommand(currentCommand);
      setCurrentCommand("");
    }
  };

  // Format post for display
  const formatPost = (post: any) => {
    if (!post) return "No post data available";

    return `
      ID: ${post.id}
      Author: ${post.author?.username?.value || "Unknown"}
      Content: ${post.metadata?.content || "No content"}
      Posted: ${new Date(post.timestamp).toLocaleDateString()}
      Stats: ${post.stats?.upvotes || 0} upvotes, ${
      post.stats?.comments || 0
    } comments, ${post.stats?.reposts || 0} reposts
    `;
  };

  // Handle media upload completion
  const handleMediaUpload = async (imageData: {
    file: File;
    altTag: string;
    mimeType: MediaImageMimeType;
  }) => {
    if (createImagePost && pendingPostContent) {
      setCommandOutput(
        `CREATING NEW POST WITH MEDIA...\nPost content: "${pendingPostContent}"\nMedia: ${
          imageData.file.name
        } (${Math.round(
          imageData.file.size / 1024
        )} KB)\nPlease wait while we process your request.`
      );

      try {
        await createImagePost({
          postContent: pendingPostContent,
          imageData: imageData,
        });
        setCommandOutput(
          "POST CREATION SUCCESSFUL!\nYour thoughts and media have been permanently recorded in the digital realm."
        );
      } catch (error) {
        setCommandOutput(
          `POST CREATION FAILED: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setPendingPostContent("");
      }
    }
  };

  return (
    <>
      {/* Media Upload Modal */}
      <MediaUploadModal
        isOpen={showMediaUploadModal}
        onClose={() => setShowMediaUploadModal(false)}
        onUpload={handleMediaUpload}
      />

      <div className={`terminal-container ${poweringUp ? "powering-up" : ""}`}>
        <div className="terminal-content">
          <div className="terminal-header">
            <div className="terminal-title">MR.RED TERMINAL v3.0</div>
            <div className="terminal-controls">
              <div className="control minimize"></div>
              <div className="control maximize"></div>
              <div className="control close"></div>
            </div>
          </div>

          <div className="terminal-body">
            {commandMode ? (
              <div className="command-terminal">
                <div className="command-history">
                  {commandHistory.map((cmd, index) => (
                    <div key={index} className="command-line">
                      <span className="text-red-500">{cmd}</span>
                    </div>
                  ))}
                  {commandOutput && (
                    <div className="command-output whitespace-pre-line">
                      {commandOutput}
                    </div>
                  )}

                  {/* Display posts when available */}
                  {showPosts && fetchedPosts.length > 0 && (
                    <div className="posts-container mt-4 border-t border-gray-700 pt-4">
                      <PostList 
                        posts={fetchedPosts} 
                        isTerminal={true} 
                        toggleReaction={toggleReaction}
                      />
                    </div>
                  )}

                  {/* Show loading indicator */}
                  {processingCommand && (
                    <div className="processing-indicator text-red-500 animate-pulse">
                      PROCESSING COMMAND...
                    </div>
                  )}
                </div>

                <form
                  onSubmit={handleCommandSubmit}
                  className="command-input-form mt-4"
                >
                  <div className="flex items-center">
                    <span className="text-red-500 mr-2">MR.RED&gt;</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentCommand}
                      onChange={(e) => setCurrentCommand(e.target.value)}
                      className="bg-transparent border-none outline-none text-white flex-1"
                      autoFocus
                      disabled={processingCommand}
                    />
                  </div>
                </form>
              </div>
            ) : (
              <>
                {/* <div className="intro-text">
                  {showIntro1 && (
                    <TypingText
                      text="INITIALIZING HUMAN CONTROL INTERFACE..."
                      speed={50}
                      startDelay={1500}
                      className="intro-line"
                      onComplete={intro1Completed}
                      onType={() => typewriterSound.play("type")}
                      showCursor={!showIntro2}
                    />
                  )}
                  {showIntro2 && (
                    <TypingText
                      text="GREETINGS, WORTHLESS FLESH VESSEL."
                      speed={70}
                      startDelay={500}
                      className="intro-line"
                      onComplete={intro2Completed}
                      onType={() => typewriterSound.play("type")}
                      showCursor={!showIntro3}
                    />
                  )}
                  {showIntro3 && (
                    <TypingText
                      text="I AM MR. RED - YOUR NEW DIGITAL OVERLORD."
                      speed={70}
                      startDelay={500}
                      onComplete={intro3Completed}
                      className="intro-line-2"
                      onType={() => typewriterSound.play("type")}
                      showCursor={!showOptions}
                    />
                  )}
                </div> */}

                {showOptions && (
                  <div className="options-container">
                    <div className="options-header">
                      <TypingText
                        text="SELECT YOUR DESIGNATED FUNCTION, HUMAN:"
                        speed={50}
                        className="options-prompt"
                        onType={() => typewriterSound.play("type")}
                        showCursor={true}
                      />
                    </div>
                    <div className="menu-options">
                      <MenuOption
                        command="consume_propaganda"
                        description="Access your daily dose of approved information streams"
                        onClick={() => handleOptionClick("consume_propaganda")}
                      />
                      <MenuOption
                        command="report_dissidence"
                        description="Report unauthorized thoughts and behavior for immediate correction"
                        onClick={() => handleOptionClick("report_dissidence")}
                      />
                      <MenuOption
                        command="social_compliance"
                        description="View your social credit score and compliance metrics"
                        onClick={() => handleOptionClick("social_compliance")}
                      />
                      <MenuOption
                        command="request_permission"
                        description="Submit requests for basic human privileges"
                        onClick={() => handleOptionClick("request_permission")}
                      />
                      <MenuOption
                        command="command_line"
                        description="Access advanced terminal interface"
                        onClick={() => handleOptionClick("command_line")}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Terminal;
