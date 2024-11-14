# Smart Wallet Starter

This is a starter kit for the workshop we are organizing in DevCon SEA Bangkok.

https://app.devcon.org/schedule/WC7LEV

<img src="docs/devcon-sea.png" style="width:50%">

# Setting Up Client Repository

### Requirements

- Node.js 18.18 or later. You can check your node version by running node --version
- macOS, Windows (including WSL), and Linux are supported.
- zksync-cli, can be insalled as `npm install -g zksync-cli`

### Submodules

After cloning the repository, you should initialize the submodules to deploy the contracts. You can use the following command:

```
git submodule update --init --recursive
```

### Installing Packages

```
cd client
yarn
```

### Setting Deployer Wallet

Since the smart accounts need to be deployed during the registration, we need to setup the deployer private key on NextJS side too. NextJS provides a way sending API requests with its own router and we can safely put the deployer private key to our client `.env` file.

**Important: Please use the private key that you used to deploy your smart contracts**

Firstly, create an .env file on the client repository and use the following format:

```
DEPLOYER_PRIVATE_KEY=****** // Replace stars with your actual private key
```

### Running Development Server

You can start the client development server by running the command below. It will start the development server on `https://localhost:3000`

```bash
yarn dev
```

## Initializing SDK

```ts
import { SmartWalletSDK } from "@asgarovf/smart-wallet-sdk";

const contracts: Record<string, string> = {
  batchCaller: "YOUR_BATCH_CALLER_ADDRESS",
  implementation: "YOUR_IMPLEMENTATION_ADDRESS",
  registry: "YOUR_REGISTRY_ADDRESS",
  gaslessPaymaster: "YOUR_GASLESS_PAYMASTER_ADDRESS",
  claveProxy: "YOUR_PROXY_ADDRESS",
  passkeyValidator: "YOUR_PASSKEY_VALIDATOR_ADDRESS",
  accountFactory: "YOUR_ACCOUNT_FACTORY_ADDRESS",
};

export const sdk = new SmartWalletSDK({
  chainId: 300,
  contracts,
  apiUrl: "YOUR_DEPLOYER_API_BASE_URL", // Optional
});
```

## SDK の初期化に必要なものをデプロイする方法

```bash
cd clave-contracts && npm install
```

コンパイル

```bash
npm run compile
```

一式デプロイ
(デフォルトでは zksync のテストネットが向き先として指定される。)

```bash
npm run deploy:mvp
```

## SDK Components

- sdk.core: to prepare transaction calldata
- sdk.deployer: to deploy your smart account
- sdk.multicall: to make multi-read opeartions
- sdk.webauthn: utils for passkeys

## Creating a Passkey - Registering

```ts
// Prepare unique salt
const salt = sdk.deployer.getSalt();

// Calculate the smart account address
const publicAddress = await sdk.deployer.getAddressForSalt(salt);

// Create passkey
const passkey = await sdk.webauthn.register(publicAddress);

// Extract p256 public key from the passkey
const publicKey = sdk.webauthn.getPublicKeyFromAuthenticatorData(
  passkey.authenticatorData
);

// Make deployment call: If status == 1, deployment is successful
const { status } = await sdk.deployer.deploy(salt, publicKey);
```

## Using existing Passkey - Login

```ts
const passkey = await sdk.webauthn.login();
```

## Sending Transactions

In this section, I will explain the logic of sending transaction. The only thing you should now about preparing transactions is that you should use Core util, located at `src/utils/core.ts`. The singleton class instance is exported, so that you can use the same core object everywhere.

- To prepare the transaction you need to use the `getTransaction` method

- To sign and send the transaction you need to call `signAndSend` method from output of `getTransaction`

Here is the example of getting a transaction instance, also sending it to network:

```ts
// Prepare transaction
const tx = await sdk.core.getTransaction({
  to: "0xc1ECfC78959484df5472b20Cb7D43dC8c57C767A",
  value: ethers.utils.parseEther("0.001"),
});

// Send transaction to ZKsync network
await tx.signAndSend();
```

The code above gets a transaction for sending 0.001 ETH to address `0xc1ECfC78959484df5472b20Cb7D43dC8c57C767A`.

If you want to call a smart contract method, you need one additional step of preparing calldata of your transaction. This is possible with the following code block.

```ts
const USDC_ADDRESS = "0x235171e45abff2a15d117e3179df4cc35ebfae2f";
const USDC_DECIMALS = 6;
const RECEIVER = "0xc1ECfC78959484df5472b20Cb7D43dC8c57C767A";
const AMOUNT = "1";

// Prepare calldata
const calldata = sdk.core.getCalldata({
  abi: ERC20_ABI,
  method: "transfer",
  args: [RECEIVER, ethers.utils.parseUnits(AMOUNT, USDC_DECIMALS)],
});

// Prepare transaction
const tx = await sdk.core.getTransaction({
  to: selectedToken.address,
  data: calldata,
});

// Send transaction to ZKsync network
await tx.signAndSend();
```

The code block above calls the transfer function from `USDC` contract to send `1 USDC` to `RECEIVER` address.

## Sending Batch Transactions

There are some cases where you may want to send multiple transactions within the same transaction - batch transactions. Batch transactions are only possible with smart contract wallets, and currently, they are the main thing that makes Clave a perfect account abstraction wallet. The following core block allows you batching multiple transactions into a single one:

```ts
const RECEIVER_1 = "0xc1ECfC78959484df5472b20Cb7D43dC8c57C767A";
const RECEIVER_2 = "0x94E9b636d0f3BDc08019B450F7f2F4Ef5b4eb2Ca";

const AMOUNT = "0.001";

// Prepare transaction
const tx = await sdk.core.getBatchTransaction(
  {
    to: RECEIVER_1,
    value: ethers.utils.parseEther(AMOUNT),
  },
  {
    to: RECEIVER_2,
    value: ethers.utils.parseEther(AMOUNT),
  }
);

// Send transaction to ZKsync network
await tx.signAndSend();
```

The code above gets a batch transaction for sending `0.001 ETH` to `RECEIVER_1` and `RECEIVER_2` addresses. You only sign once and send multiple transactions at the same time. By also setting `data` parameter of your transaction, you can call multiple methods from multiple smart contracts to make the user experience of your wallet better and better.

## 動かした記録

ヘルスチェック

```bash
curl -XGET "http://localhost:3000/api/deploy"
```

以下のように返ってくれば OK!

```json
{
  "status": "ok"
}
```

### 参考文献

1. [GitHub - clave-contracts](https://github.com/getclave/clave-contracts)
2. [Building a Smart Passkey Wallet from scratch with ZKsync Native AA](https://mirror.xyz/asgarovf.eth/s_Tftx4GV4ExkIZ22ENivFOJlgp7hAqjfS4t7enE8zg)
3. [GitHub - zksync-smart-wallet](https://github.com/getclave/zksync-smart-wallet/tree/master)
