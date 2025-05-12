"use client";

import { signMessageWith } from "@lens-protocol/client/viem";
import { uri, evmAddress } from "@lens-protocol/client";
import {
  MetadataAttributeType,
  account,
  textOnly,
} from "@lens-protocol/metadata";
import { immutable, StorageClient } from "@lens-chain/storage-client";
import {
  createAccountWithUsername,
  fetchAccount,
  post,
  fetchPosts,
  fetchPostsForYou,
} from "@lens-protocol/client/actions";
import { useWalletClient } from "wagmi";
import { useState, useEffect } from "react";
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
const DELAY = 30000;

const App = () => {
  // State to track whether to show onboarding or terminal
  const [showOnboarding, setShowOnboarding] = useState(true);
  // State to track loading state during authentication check
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const APP_ADDRESS = "0xE4074286Ff314712FC2094A48fD6d7F0757663aD";

  const { data: walletClient } = useWalletClient();

  const storageClient = StorageClient.create();
  const metadata = account({
    name: "Jane Doe",
    bio: "I am a photographer based in New York City.",
    picture: "lens://4f91cab87ab5e4f5066f878b72…",
    coverPicture: "lens://4f91cab87ab5e4f5066f8…",
    attributes: [
      {
        key: "twitter",
        type: MetadataAttributeType.STRING,
        value: "https://twitter.com/janedoexyz",
      },
      {
        key: "dob",
        type: MetadataAttributeType.DATE,
        value: "1990-01-01T00:00:00Z",
      },
    ],
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
    // const client = getPublicClient();
    const sessionClient = await getLensClient();

    if (sessionClient.isPublicClient()) {
      console.error("Public client");
      return;
    }

    const metadata = textOnly({
      content: postContent,
    });

    const { uri: postUri } = await storageClient.uploadAsJson(metadata);

    console.log(postUri);

    console.log("Posting... credirtals", sessionClient.getCredentials());
    console.log(
      "Posting... authenitcate",
      sessionClient.getAuthenticatedUser()
    );

    const result = await post(sessionClient, {
      contentUri: postUri,
    }).andThen(handleOperationWith(walletClient));

    console.log({ result });

    console.log("Transaction confirmed");
  };

  const fetchUserFeed = async () => {
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
      const result = await fetchPostsForYou(client, {
        account: evmAddress(walletClient.account.address),
        shuffle: true, // optional, shuffle the results
      });

      if (result.isErr()) {
        console.error(result.error);
        return result;
      }

      console.log({ result });
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

  // Check if user is authenticated
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsAuthChecking(true);
      try {
        const client = getPublicClient();
        const resumed = await client.resumeSession();
        if (resumed.isOk()) {
          // User is authenticated, show Terminal
          setShowOnboarding(false);
        } else {
          // User is not authenticated, show Onboarding
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setShowOnboarding(true);
      } finally {
        // Add a longer delay to showcase the loading animation
        setTimeout(() => {
          setIsAuthChecking(false);
        }, DELAY);
      }
    };

    checkAuthentication();
  }, []);

  // Determine which component to render based on state
  const renderComponent = () => {
    // if (isAuthChecking) {
    //   return <LoadingScreen />;
    // } else if (!showOnboarding) {
    //   return <Onboarding onboardUser={onboardUser} />;
    // } else {
    //   return (
    //     <Terminal
    //       createTextPost={createTextPost}
    //       fetchUserPosts={fetchUserPosts}
    //       fetchUserPostsForYou={fetchUserPostsForYou}
    //     />
    //   );
    // }
    return (
      <Terminal
        createTextPost={createTextPost}
        fetchUserPosts={fetchUserPosts}
        fetchUserFeed={fetchUserFeed}
      />
    );
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
          <Button onClick={fetchUserPosts} size="sm" variant="destructive">
            Fetch
          </Button>
        </div>
      )}
    </div>
  );
};

export default App;
