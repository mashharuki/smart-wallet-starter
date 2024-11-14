# Smart Wallet Starter キット 日本語要約

この資料は、DevCon SEA バンコクで開催されるワークショップのためのスマートウォレットのスターターキットに関するものです。

## クライアントリポジトリのセットアップ手順

### 必要条件

- Node.js 18.18 以上が必要です（`node --version`で確認可能）。
- macOS、Windows（WSL 含む）、Linux に対応。
- `zksync-cli` は以下のコマンドでインストール可能です。
  ```bash
  npm install -g zksync-cli
  ```

サブモジュール
リポジトリをクローンした後、以下のコマンドでサブモジュールを初期化し、コントラクトをデプロイします。

```bash
git submodule update --init --recursive
```

パッケージのインストール

```bash
yarn
```

```bash
cd client
npm install
```

デプロイヤーウォレットの設定
スマートアカウント登録時にデプロイヤーの秘密鍵が必要です。

.env ファイルに以下の形式で設定します。

```plaintext
DEPLOYER_PRIVATE_KEY=**\*\*** // 実際の秘密鍵に置き換えます
```

開発サーバーの起動
以下のコマンドで開発サーバーを起動できます。

```bash
yarn dev
```

これにより https://localhost:3000 で開発サーバーが起動します。

SDK の初期化
スマートウォレット SDK のインポートと設定を行います。

```typescript
import { SmartWalletSDK } from "@asgarovf/smart-wallet-sdk";
const contracts = { ... };
export const sdk = new SmartWalletSDK({
chainId: 300,
contracts,
apiUrl: "YOUR_DEPLOYER_API_BASE_URL", // 任意
});
SDK のコンポーネント
sdk.core: トランザクションのデータを準備
sdk.deployer: スマートアカウントをデプロイ
sdk.multicall: 複数の読み取り操作
sdk.webauthn: パスキー関連のユーティリティ
パスキーの作成・登録
新しいパスキーの作成・登録例です。

typescript
コードをコピーする
const salt = sdk.deployer.getSalt();
const publicAddress = await sdk.deployer.getAddressForSalt(salt);
const passkey = await sdk.webauthn.register(publicAddress);
const publicKey = sdk.webauthn.getPublicKeyFromAuthenticatorData(passkey.authenticatorData);
const { status } = await sdk.deployer.deploy(salt, publicKey);
既存のパスキーの使用 - ログイン
typescript
コードをコピーする
const passkey = await sdk.webauthn.login();
トランザクションの送信
以下のコードで、0.001 ETH を特定のアドレスに送信するトランザクションを準備・送信します。

typescript
コードをコピーする
const tx = await sdk.core.getTransaction({
to: "0xc1ECfC78959484df5472b20Cb7D43dC8c57C767A",
value: ethers.utils.parseEther("0.001"),
});
await tx.signAndSend();
スマートコントラクトメソッド呼び出しの場合、データ準備が必要です。

バッチトランザクションの送信
以下のコードで、複数のトランザクションを一度に送信するバッチトランザクションを作成します。

typescript
コードをコピーする
const tx = await sdk.core.getBatchTransaction(
{ to: RECEIVER_1, value: ethers.utils.parseEther("0.001") },
{ to: RECEIVER_2, value: ethers.utils.parseEther("0.001") }
);
await tx.signAndSend();
go
コードをコピーする

このコードにより、複数のトランザクションを一度に実行できます。`data`パラメータを設定することで、複数のスマ
```
