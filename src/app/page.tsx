"use client";

import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { signMessageWith } from "@lens-protocol/client/viem";
import { PublicClient, mainnet, testnet, uri } from "@lens-protocol/client";
import { fragments } from "@/fragments";
import { MetadataAttributeType, account } from "@lens-protocol/metadata";
import { StorageClient } from "@lens-chain/storage-client";
import { createAccountWithUsername } from "@lens-protocol/client/actions";
import { Login } from "@/components/Login";
import { useWalletClient, useAccount } from "wagmi";
import { getLensClient, getPublicClient } from "@/lib/lens/client";

// const client = PublicClient.create({
//   environment: mainnet,
//   fragments,
//   // origin: "http://localhost:3000",
// });

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
      {
        key: "enabled",
        type: MetadataAttributeType.BOOLEAN,
        value: "true",
      },
      {
        key: "height",
        type: MetadataAttributeType.NUMBER,
        value: "1.65",
      },
      {
        key: "settings",
        type: MetadataAttributeType.JSON,
        value: '{"theme": "dark"}',
      },
    ],
  });

  // console.log({ signer });

  const onboardUser = async () => {
    if (!walletClient) {
      console.error("Wallet not connected. Please connect your wallet first.");
      return;
    }
    const client = getPublicClient();
    // if (!client.isSessionClient()) {
    //   console.error("Client is not a session client");
    //   return null;
    // }

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

    const { uri: lensUri } = await storageClient.uploadAsJson(metadata);
    console.log(uri(lensUri)); // e.g., lens://4f91ca…

    const result = await createAccountWithUsername(sessionClient, {
      username: { localName: "bestuserByBestuaer", namespace: "lens" },
      metadataUri: uri(lensUri),
    });
    console.log({ result });
  };

  // await onboardUser();

  // const createAccountOwner = async () => {
  //   const accountOwner = await client.login({
  //     accountOwner: {
  //       app: APP_ADDRESS,
  //       account: signer.address, // not sure what this is
  //       owner: signer.address, // owner is the wallet address
  //     },
  //     signMessage: signMessageWith(signer),
  //   });

  //   console.log({ accountOwner });

  //   if (accountOwner.isErr()) {
  //     return console.error(accountOwner.error);
  //   }

  //   const sessionClient = accountOwner.value;
  //   console.log({ sessionClient });
  // };

  return (
    <>
      <Login />
      {isConnected && <p>Connected</p>}
      {address && <p>{address}</p>}
      {isConnected && (
        <button onClick={onboardUser}>Create Onboard User</button>
      )}
    </>
  );
};

export default App;
