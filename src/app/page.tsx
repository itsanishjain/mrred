"use client";

import { postId, PostReferenceType } from "@lens-protocol/client";
import { signMessageWith } from "@lens-protocol/client/viem";
import { uri, evmAddress } from "@lens-protocol/client";
import {
  MetadataAttributeType,
  account,
  textOnly,
  image,
  MediaImageMimeType,
} from "@lens-protocol/metadata";
import { immutable, StorageClient } from "@lens-chain/storage-client";
import {
  createAccountWithUsername,
  fetchAccount,
  post,
  fetchPosts,
  fetchPostsForYou,
  addReaction,
  undoReaction,
  fetchPostReferences,
} from "@lens-protocol/client/actions";
import { useWalletClient } from "wagmi";
import { useState, useEffect, useCallback } from "react";
import { getLensClient, getPublicClient } from "@/lib/lens/client";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { never } from "@lens-protocol/client";
import { chains } from "@lens-chain/sdk/viem";
import Terminal from "@/components/terminal/Terminal";
import Onboarding from "@/components/onboarding/Onboarding";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/terminal-loading";
import { PageTransition } from "@/components/transitions/PageTransition";

const DEBUG_BUTTONS = false;
const DELAY = 0;

const App = () => {
  // State to track whether to show onboarding or terminal
  const [showOnboarding, setShowOnboarding] = useState(true);
  // State to track loading state during authentication check
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  // State to track sound preference
  const [soundEnabled, setSoundEnabled] = useState(true);
  // State to track if user has made a sound choice
  const [soundChoiceMade, setSoundChoiceMade] = useState(false);
  const APP_ADDRESS = "0xE4074286Ff314712FC2094A48fD6d7F0757663aD";

  const { data: walletClient } = useWalletClient();

  const storageClient = StorageClient.create();
  // TODO: Replace with your own metadata
  const metadata = account({
    name: "MrRed",
    bio: "MR.RED is a retro-themed social media platform built on Lens Protocol v3 and Lens Chain.",
  });

  const onboardUser = async () => {
    if (!walletClient) {
      console.error("Wallet not connected. Please connect your wallet first.");
      return;
    }
    const client = getPublicClient();

    console.log("environment", client.context.environment);

    const authenticated = await client.login({
      onboardingUser: {
        app: APP_ADDRESS,
        wallet: walletClient.account.address,
      },
      signMessage: signMessageWith(walletClient),
    });

    console.log({ authenticated });

    if (authenticated.isErr()) {
      console.error("Authentication failed", authenticated.error);
      return;
    }

    const sessionClient = authenticated.value;

    console.log({ sessionClient });

    const { uri: lensUri } = await storageClient.uploadFile(
      new File([JSON.stringify(metadata)], "metadata.json", {
        type: "application/json",
      }),
      { acl: immutable(chains.testnet.id) }
    );

    console.log({ lensUri });
    console.log({ sessionClient });
    console.log("walletClient", walletClient.account.address);

    const result = await createAccountWithUsername(sessionClient, {
      username: { localName: `john-doe-${Date.now()}` },
      metadataUri: uri(lensUri),
    })
      .andThen(handleOperationWith(walletClient))
      .andThen(sessionClient.waitForTransaction)
      .andThen((txHash) => fetchAccount(sessionClient, { txHash }))
      .andThen((account) => {
        console.log("It's working....");
        return sessionClient.switchAccount({
          account: account?.address ?? never("Account not found"),
        });
      })
      .match(
        (result) => result,
        (error) => {
          throw error;
        }
      );

    console.log({ result });
  };

  const createTextPost = async ({ postContent }: { postContent: string }) => {
    if (!walletClient) {
      console.error("Wallet not connected. Please connect your wallet first.");
      return;
    }

    const sessionClient = await getLensClient();

    if (sessionClient.isPublicClient()) {
      console.error("Public client");
      return;
    }

    try {
      console.log("Creating text post with content:", postContent);

      // Create text-only metadata
      const metadata = textOnly({
        content: postContent,
      });

      // Upload metadata to storage
      const { uri: postUri } = await storageClient.uploadAsJson(metadata);

      console.log("Text post URI:", postUri);

      // Create the post
      const result = await post(sessionClient, {
        contentUri: postUri,
      }).andThen(handleOperationWith(walletClient));

      if (result.isErr()) {
        console.error("Error creating post:", result.error);
        throw new Error("Post creation failed: " + result.error.message);
      }

      console.log("Text post result:", result.value);
      console.log("Text post transaction confirmed");
    } catch (error) {
      console.error("Error creating text post:", error);
      throw error;
    }
  };

  const createImagePost = async ({
    postContent,
    imageData,
  }: {
    postContent: string;
    imageData: {
      file: File;
      altTag: string;
      mimeType: MediaImageMimeType;
    };
  }): Promise<void> => {
    if (!walletClient) {
      console.error("Wallet not connected. Please connect your wallet first.");
      return;
    }

    const sessionClient = await getLensClient();

    if (sessionClient.isPublicClient()) {
      console.error("Public client");
      return;
    }

    try {
      console.log("Creating image post with:", { postContent, imageData });

      // Upload the image file to storage using the storage client
      console.log("Uploading image file:", imageData.file.name);

      // Use the immutable ACL for the testnet chain
      const acl = immutable(chains.testnet.id);

      // Upload the file to storage
      const { uri: imageUri } = await storageClient.uploadFile(imageData.file, {
        acl,
      });

      console.log("Image uploaded successfully, URI:", imageUri);

      // Create image metadata that includes both text and image
      // Unlike textOnly() which only has text, image() includes both text content and image data
      const metadata = image({
        title: postContent.substring(0, 100), // Use first 100 chars of post content as title
        content: postContent, // This is the text content of the post - same as in textOnly()
        image: {
          item: imageUri, // Use the URI from the uploaded image
          type: imageData.mimeType,
          altTag: imageData.altTag,
        },
      });

      console.log("Created image metadata:", metadata);

      // Upload metadata to storage
      const { uri: postUri } = await storageClient.uploadAsJson(metadata);

      console.log("Image post URI:", postUri);

      // Create the post
      const result = await post(sessionClient, {
        contentUri: postUri,
      }).andThen(handleOperationWith(walletClient));

      if (result.isErr()) {
        console.error("Error creating post:", result.error);
        throw new Error("Post creation failed: " + result.error.message);
      }

      console.log("Image post result:", result.value);
      console.log("Image post transaction confirmed");
    } catch (error) {
      console.error("Error creating image post:", error);
      throw error;
    }
  };

  const toggleReaction = async (postId: string, isLiked: boolean) => {
    if (!walletClient) {
      console.error("Wallet client not available");
      return { success: false, isLiked: isLiked };
    }

    try {
      console.log(`${isLiked ? "Unliking" : "Liking"} post with ID:`, postId);

      // Get an authenticated session client
      const lensClient = await getLensClient();
      if (lensClient.isPublicClient()) {
        console.error("Not authenticated. Please connect your wallet first.");
        return { success: false, isLiked: isLiked };
      }

      let result;
      if (isLiked) {
        // Unlike the post
        result = await undoReaction(lensClient, {
          reaction: "UPVOTE",
          post: postId,
        });
      } else {
        // Like the post
        result = await addReaction(lensClient, {
          reaction: "UPVOTE",
          post: postId,
        });
      }

      if (result.isErr()) {
        console.error(
          `Error ${isLiked ? "unliking" : "liking"} post:`,
          result.error
        );
        return { success: false, isLiked: isLiked };
      }

      console.log(
        `Post ${isLiked ? "unliked" : "liked"} successfully:`,
        result.value
      );
      return { success: true, isLiked: !isLiked };
    } catch (error) {
      console.error(`Error in toggle reaction function:`, error);
      return { success: false, isLiked: isLiked };
    }
  };

  const fetchUserFeed = async (cursor?: string | null) => {
    if (!walletClient) {
      console.error("Wallet not connected. Please connect your wallet first.");
      return;
    }
    const client = getPublicClient();
    const lensClient = await getLensClient();

    if (lensClient.isPublicClient()) {
      console.log("Public client");
      return;
    }

    try {
      console.log("Fetching feed with params:", {
        account: walletClient.account.address,
        shuffle: cursor ? false : true,
        cursor: cursor,
      });

      const result = await fetchPostsForYou(client, {
        account: evmAddress(walletClient.account.address),
        shuffle: cursor ? false : true, // Only shuffle on initial load
        cursor: cursor, // Pass the cursor for pagination
      });

      if (result.isErr()) {
        console.error("Feed fetch error:", result.error);
        return result;
      }

      // Log detailed information about the result
      if (result.value) {
        const itemsCount = result.value.items?.length || 0;
        console.log("Feed fetch success, items count:", itemsCount);

        if (itemsCount > 0) {
          // Log the structure of the first item to understand its format
          const firstItem = result.value.items[0];
          console.log("First item keys:", Object.keys(firstItem));

          // Check if this is a PostForYou type that needs unwrapping
          if (firstItem.__typename === "PostForYou") {
            console.log(
              "Item is PostForYou type, contains post property:",
              !!firstItem.post
            );
            if (firstItem.post) {
              console.log("Post property keys:", Object.keys(firstItem.post));
              // Log important fields we need for mapping
              console.log("Post ID:", firstItem.post.id);
              console.log("Post author:", firstItem.post.author);
              console.log("Post metadata:", firstItem.post.metadata);
              console.log("Post timestamp:", firstItem.post.timestamp);
            }
          } else {
            // Direct post type - only log if we can access these properties safely
            console.log(
              "Direct post type, keys available:",
              Object.keys(firstItem)
            );
            // Use optional chaining to avoid errors
            console.log("Post ID:", firstItem?.post?.id);
            console.log("Post author:", firstItem?.post?.author);
            console.log("Post metadata:", firstItem?.post?.metadata);
            console.log("Post timestamp:", firstItem?.post?.timestamp);
          }
        } else {
          console.log("No items in the feed result");
        }

        console.log("Page info:", result.value.pageInfo || {});
      } else {
        console.log("Feed fetch success, but no value returned");
      }

      return result as any; // Type cast to avoid type errors
    } catch (error) {
      console.error("Error fetching feed:", error);
      return;
    }
  };

  const fetchUserPosts = async () => {
    if (!walletClient) {
      console.error("Wallet not connected. Please connect your wallet first.");
      return;
    }
    const client = getPublicClient();
    const lensClient = await getLensClient();

    if (lensClient.isPublicClient()) {
      console.log("Public client");
      return;
    }

    const authenitcateUser = lensClient.getAuthenticatedUser();

    if (authenitcateUser.isErr()) {
      return;
    }

    if (authenitcateUser) {
      const myPosts = await fetchPosts(client, {
        filter: {
          authors: [authenitcateUser.value.address],
        },
      });

      if (myPosts.isErr()) {
        return console.error(myPosts.error);
      }

      console.log({ myPosts });
      return myPosts;
    }
  };

  const fetchPostComments = async (lensPostId: string) => {
    if (!walletClient) {
      console.error("Wallet not connected. Please connect your wallet first.");
      return;
    }

    const client = getPublicClient();

    try {
      const result = await fetchPostReferences(client, {
        referencedPost: postId(lensPostId),
        referenceTypes: [PostReferenceType.CommentOn],
      });

      if (result.isErr()) {
        console.error("Error fetching post:", result.error);
        return;
      }

      console.log("Post fetched successfully:", result.value);
      return result.value;
    } catch (error) {
      console.error("Error fetching post:", error);
      return;
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const client = await getLensClient();
      if (!client.isPublicClient()) {
        const result = await client.logout();
        console.log("User logged out successfully");
        // Reset state to show onboarding after logout
        setShowOnboarding(true);
        setSoundChoiceMade(false);
        // Reset any other necessary state
        setIsAuthChecking(false);
      } else {
        console.log("No active session to logout from");
        // Even if there's no active session, we still want to go back to onboarding
        setShowOnboarding(true);
        setSoundChoiceMade(false);
      }
    } catch (error) {
      console.error("Error during logout:", error);
      // Even on error, redirect to onboarding for better UX
      setShowOnboarding(true);
      setSoundChoiceMade(false);
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsAuthChecking(true);
      try {
        const client = getPublicClient();
        const resumed = await client.resumeSession();
        if (resumed.isOk()) {
          console.log("User is authenticated");
          // User is authenticated, but we need to check if they've made a sound choice
          const savedSoundPreference = localStorage.getItem(
            "mrred_sound_enabled"
          );
          if (savedSoundPreference !== null) {
            setSoundEnabled(savedSoundPreference === "true");
            setSoundChoiceMade(true);
          } else {
            // If no sound preference is saved, we'll need to show the sound choice screen
            setSoundChoiceMade(false);
          }
          // Set to show terminal instead of onboarding
          setShowOnboarding(false);
        } else {
          console.log("User is not authenticated");
          // User is not authenticated, show Onboarding
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setShowOnboarding(true);
      } finally {
        // Add a delay to showcase the loading animation
        setTimeout(() => {
          setIsAuthChecking(false);
        }, DELAY);
      }
    };

    checkAuthentication();
  }, []);

  // Handle sound preference change
  const handleSoundToggle = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    setSoundChoiceMade(true);
    // Store sound preference in localStorage
    localStorage.setItem("mrred_sound_enabled", enabled ? "true" : "false");
  }, []);

  // We'll handle sound preference loading in the authentication check instead
  // This ensures we have a consistent flow for both initial load and refreshes

  // Determine which component to render based on state
  const renderComponent = () => {
    if (isAuthChecking) {
      // If we're checking auth, show loading screen with sound option if not already chosen
      return (
        <LoadingScreen
          soundEnabled={soundEnabled}
          onSoundToggle={handleSoundToggle}
          showSoundOption={!soundChoiceMade}
        />
      );
    } else if (showOnboarding) {
      // Show onboarding with sound toggle capability
      return (
        <Onboarding
          onboardUser={onboardUser}
          setSoundEnabled={handleSoundToggle}
        />
      );
    } else {
      // If authenticated and sound choice not made, show a sound choice screen
      if (!soundChoiceMade) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <div className="max-w-md w-full bg-zinc-900 p-6 rounded-md border border-red-800">
              <h2 className="text-xl font-bold mb-4 text-red-500">
                AUDIO SETTINGS
              </h2>
              <p className="mb-4">
                Choose your audio preference before entering the terminal:
              </p>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => handleSoundToggle(true)}
                  className="flex-1 py-2 bg-green-800 hover:bg-green-700 text-white font-bold border border-green-600 rounded"
                >
                  ENABLE AUDIO
                </button>
                <button
                  onClick={() => handleSoundToggle(false)}
                  className="flex-1 py-2 bg-red-800 hover:bg-red-700 text-white font-bold border border-red-600 rounded"
                >
                  DISABLE AUDIO
                </button>
              </div>

              <button
                onClick={() => setSoundChoiceMade(true)}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold border border-zinc-600 rounded"
              >
                PROCEED TO TERMINAL
              </button>
            </div>
          </div>
        );
      }

      // If sound choice is made, show the terminal
      return (
        <Terminal
          createTextPost={createTextPost}
          createImagePost={createImagePost}
          fetchUserPosts={fetchUserPosts}
          fetchUserFeed={fetchUserFeed}
          toggleReaction={toggleReaction}
          fetchPostComments={fetchPostComments}
          handleLogout={handleLogout}
          soundEnabled={soundEnabled}
          onSoundToggle={handleSoundToggle}
        />
      );
    }
    // return (
    //   <Terminal
    //     createTextPost={createTextPost}
    //     createImagePost={createImagePost}
    //     fetchUserPosts={fetchUserPosts}
    //     fetchUserFeed={fetchUserFeed}
    //     toggleReaction={toggleReaction}
    //     fetchPostComments={fetchPostComments}
    //   />
    // );
  };

  // Generate a unique location key based on the current state
  const locationKey = isAuthChecking
    ? "loading"
    : showOnboarding
    ? "onboarding"
    : "terminal";

  return (
    <div className="min-h-screen w-full overflow-hidden bg-black">
      <PageTransition location={locationKey}>
        {renderComponent()}
      </PageTransition>

      {/* Debug buttons - can be removed in production */}
      {DEBUG_BUTTONS && (
        <div className="fixed bottom-4 right-4 flex gap-2 z-50">
          <Button onClick={onboardUser} size="sm" variant="destructive">
            Onboard
          </Button>
          <Button
            onClick={() => createTextPost({ postContent: "lens is the best" })}
            size="sm"
            variant="destructive"
          >
            Post
          </Button>
          <Button
            onClick={() => fetchUserPosts()}
            size="sm"
            variant="destructive"
          >
            Posts
          </Button>
          <Button
            onClick={() => fetchUserFeed()}
            size="sm"
            variant="destructive"
          >
            Feed
          </Button>
          <Button
            onClick={async () => {
              const result = await fetchUserFeed();
              if (result?.isOk()) {
                const nextCursor = result.value.pageInfo.next;
                if (nextCursor) {
                  console.log("Next cursor:", nextCursor);
                  // Test pagination by fetching next page
                  const nextPage = await fetchUserFeed(nextCursor);
                  console.log("Next page result:", nextPage);
                }
              }
            }}
            size="sm"
            variant="outline"
          >
            Test Pagination
          </Button>
          <Button
            onClick={async () => {
              const result = await fetchPostComments(
                "16985316692732001748345996819097694829110864246656038097073600309179629283048"
              );
              console.log("Post comments result:", result);
            }}
            size="sm"
            variant="outline"
          >
            Test Post Comments
          </Button>
        </div>
      )}
    </div>
  );
};

export default App;
