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
import { useWalletClient, useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { getLensClient, getPublicClient } from "@/lib/lens/client";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { never } from "@lens-protocol/client";
import { chains } from "@lens-chain/sdk/viem";
import Terminal from "@/components/terminal/Terminal";
import Onboarding from "@/components/onboarding/Onboarding";
import { Button } from "@/components/ui/button";

const App = () => {
  // State to track whether to show onboarding or terminal
  const [showOnboarding, setShowOnboarding] = useState(true);
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

  const createTextPost = async () => {
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
      content: `MOM IS MOM`,
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

  const fetchUserPostsForYou = async () => {
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

    const result = await fetchPostsForYou(client, {
      account: evmAddress(walletClient.account.address),
      shuffle: true, // optional, shuffle the results
    });

    if (result.isErr()) {
      return console.error(result.error);
    }

    console.log({ result });
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
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    const checkAuthentication = async () => {
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
      }
    };

    checkAuthentication();
  }, []);

  return (
    <>
      {showOnboarding ? (
        <Onboarding onboardUser={onboardUser} />
      ) : (
        <Terminal
          createTextPost={createTextPost}
          fetchUserPosts={fetchUserPosts}
          fetchUserPostsForYou={fetchUserPostsForYou}
        />
      )}

      {/* <Terminal
        createTextPost={createTextPost}
        fetchUserPosts={fetchUserPosts}
        fetchUserPostsForYou={fetchUserPostsForYou}
      /> */}

      {/* Debug buttons - can be removed in production */}
      {/* <div className="flex gap-2 justify-center items-center h-screen">
        <Button onClick={onboardUser}>Onboard User</Button>
        <Button onClick={createTextPost}>Create Post</Button>
        <Button onClick={fetchUserPosts}>Fetch Posts</Button>
        <Button onClick={fetchUserPostsForYou}>Fetch Posts For You</Button>
      </div> */}
    </>
  );
};

export default App;
