import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { signMessageWith } from "@lens-protocol/client/viem";
import { PublicClient, mainnet, testnet, uri } from "@lens-protocol/client";
import { fragments } from "@/fragments";
import { MetadataAttributeType, account } from "@lens-protocol/metadata";
import { StorageClient } from "@lens-chain/storage-client";
import { createAccountWithUsername } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

const client = PublicClient.create({
  environment: mainnet,
  fragments,
  origin: "http://localhost:3000",
});

const App = async () => {
  const privateKey = generatePrivateKey();
  const signer = privateKeyToAccount(privateKey);
  const APP_ADDRESS = "0xE4074286Ff314712FC2094A48fD6d7F0757663aD";

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

  console.log({ signer });

  const onboardUser = async () => {
    const authenticated = await client.login({
      onboardingUser: {
        app: APP_ADDRESS,
        wallet: signer.address,
      },
      signMessage: signMessageWith(signer),
    });

    console.log({ authenticated });

    if (authenticated.isErr()) {
      console.error(authenticated.error);
      return;
    }

    const sessionClient = authenticated.value;

    console.log({ sessionClient });

    const { uri: lensUri } = await storageClient.uploadAsJson(metadata);
    console.log({ lensUri }); // e.g., lens://4f91ca…

    const result = await createAccountWithUsername(sessionClient, {
      username: { localName: "mrredboyscum", namespace: "lens" },
      metadataUri: uri(lensUri),
    });
    console.log({ result });
  };

  // await onboardUser();

  // const accountOwner = await client.login({
  //   accountOwner: {
  //     account: signer.address,
  //     app: APP_ADDRESS,
  //     owner: signer.address,
  //   },
  //   signMessage: signMessageWith(signer),
  // });

  // console.log({ accountOwner });

  // if (accountOwner.isErr()) {
  //   return console.error(accountOwner.error);
  // }

  // // SessionClient: { ... }
  // const sessionClient = accountOwner.value;

  // console.log({ sessionClient });

  return <>hell world</>;
};

export default App;
