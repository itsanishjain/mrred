"use client";

import React, { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { useAccount } from "wagmi";
import { useWalletClient } from "wagmi";
import { StorageClient } from "@lens-chain/storage-client";
import { account } from "@lens-protocol/metadata";
import { MetadataAttributeType } from "@lens-protocol/metadata";
import { Ok, UnexpectedError } from "@lens-protocol/client";
import { Paginated, AnyPost } from "@lens-protocol/client";
import { useToast } from "@/hooks/use-toast";
import { signMessageWith } from "@lens-protocol/client/viem";
import { uri, evmAddress } from "@lens-protocol/client";
import { textOnly } from "@lens-protocol/metadata";
import { immutable } from "@lens-chain/storage-client";
import {
  createAccountWithUsername,
  fetchAccount,
  post,
  fetchPosts,
  fetchPostsForYou,
} from "@lens-protocol/client/actions";
import { getLensClient, getPublicClient } from "@/lib/lens/client";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { never } from "@lens-protocol/client";
import { chains } from "@lens-chain/sdk/viem";
import Onboarding from "@/components/onboarding/Onboarding";

export default function Login() {
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

  return <Onboarding onboardUser={onboardUser} />;
}
