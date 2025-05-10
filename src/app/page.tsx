"use client";

import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { signMessageWith } from "@lens-protocol/client/viem";
import { uri, evmAddress, txHash } from "@lens-protocol/client";
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
  lastLoggedInAccount,
  fetchPosts,
  currentSession,
  fetchPostsForYou,
} from "@lens-protocol/client/actions";
import { Login } from "@/components/Login";
import { useWalletClient, useAccount } from "wagmi";
import { getLensClient, getPublicClient } from "@/lib/lens/client";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { never } from "@lens-protocol/client";
import { chains } from "@lens-chain/sdk/viem";

const App = () => {
  const privateKey = generatePrivateKey();
  const signer = privateKeyToAccount(privateKey);
  const APP_ADDRESS = "0xE4074286Ff314712FC2094A48fD6d7F0757663aD";
  const { address, isConnected } = useAccount();

  const { data: walletClient } = useWalletClient();

  const storageClient = StorageClient.create();
  console.log({ storageClient });

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

    // const { uri: lensUri } = await storageClient.uploadAsJson(metadata);
    // console.log(uri(lensUri));

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

    // const lastLoggedInAccountResult = await lastLoggedInAccount(client, {
    //   app: evmAddress(APP_ADDRESS),
    //   address: evmAddress(walletClient.account.address),
    // });

    // if (lastLoggedInAccountResult.isErr()) {
    //   console.error(lastLoggedInAccountResult.error);
    //   return;
    // }

    // console.log({ lastLoggedInAccountResult });

    // const account = lastLoggedInAccountResult.value;

    // const authenticated = await client.login({
    //   accountOwner: {
    //     app: APP_ADDRESS,
    //     account: account?.address ?? never("Account not found"),
    //     owner: walletClient.account.address,
    //   },
    //   signMessage: signMessageWith(walletClient),
    // });

    // console.log({ authenticated });

    // if (authenticated.isErr()) {
    //   console.error("Authentication failed", authenticated.error);
    //   return;
    // }

    // const sessionClient = authenticated.value;

    console.log({ sessionClient });

    const metadata = textOnly({
      content: `HOLA MUNDO`,
    });

    const { uri: postUri } = await storageClient.uploadAsJson(metadata);

    console.log(postUri);

    const result = await post(sessionClient, {
      contentUri: postUri,
    });
    console.log({ result });
  };

  const fetchUserPosts = async () => {
    if (!walletClient) {
      console.error("Wallet not connected. Please connect your wallet first.");
      return;
    }
    const client = getPublicClient();
    const lensClient = await getLensClient();

    const hash =
      "0x579cfaaba07d2b8e6779a418907e5e17e9d521edb123f602495a95a94a3cd209";

    console.log({ lensClient });

    const result = await fetchPostsForYou(client, {
      account: evmAddress(walletClient.account.address),
      shuffle: true, // optional, shuffle the results
    });

    if (result.isErr()) {
      return console.error(result.error);
    }

    console.log({ result });

    // fetch my posts

    const myPosts = await fetchPosts(client, {
      filter: {
        authors: [evmAddress(walletClient.account.address)],
      },
    });

    if (myPosts.isErr()) {
      return console.error(myPosts.error);
    }

    console.log({ myPosts });

    // const lastLoggedInAccountResult = await lastLoggedInAccount(client, {
    //   app: evmAddress(APP_ADDRESS),
    //   address: evmAddress(walletClient.account.address),
    // });

    // if (lastLoggedInAccountResult.isErr()) {
    //   console.error(lastLoggedInAccountResult.error);
    //   return;
    // }

    // console.log({ lastLoggedInAccountResult });

    // const account = lastLoggedInAccountResult.value;

    // console.log("the account", account);

    // const authenticated = await client.login({
    //   accountOwner: {
    //     app: APP_ADDRESS,
    //     account: account?.address ?? never("Account not found"),
    //     owner: walletClient.account.address,
    //   },
    //   signMessage: signMessageWith(walletClient),
    // });

    // console.log({ authenticated });

    // if (authenticated.isErr()) {
    //   console.error("Authentication failed", authenticated.error);
    //   return;
    // }

    // const sessionClient = authenticated.value;

    // console.log({ sessionClient });

    // console.log(">>>>", walletClient.account.address);

    // const posts = await fetchPosts(client, {
    //   filter: {
    //     authors: [walletClient.account.address ?? never("Account not found")],
    //   },
    // });
    // console.log({ posts });

    // if (posts.isErr()) {
    //   return console.error(posts.error);
    // }

    // // items: Array<AnyPost>
    // const { items, pageInfo } = posts.value;
    // console.log({ items, pageInfo });
  };

  return (
    <>
      <Login />
      {isConnected && <p>Connected</p>}
      {address && <p>{address}</p>}
      {isConnected && (
        <>
          <button onClick={onboardUser}>Create Onboard User</button>
          <button onClick={createTextPost}>Create Text Post</button>
          <button onClick={fetchUserPosts}>Fetch User Posts</button>
        </>
      )}
    </>
  );
};

export default App;
