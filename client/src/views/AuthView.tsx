'use client';
import { SmartWalletSDK } from "@asgarovf/smart-wallet-sdk";
import { useMutation } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { FaArrowCircleRight, FaUserPlus } from 'react-icons/fa';
import { TailSpin } from 'react-loading-icons';

// コントラクト用の設定を一式設定
const contracts: Record<string, string> = {
    batchCaller: '0x1513dB8DdC9420728bFb2830AE6784B26Ac9bf25',
    implementation: '0x5627beD3bA7DFc5D9DbAa0122A52C7F22a2DD4D3',
    registry: '0x7f273AF2576EA32309c32c9bae2b609B6e4484aC',
    gaslessPaymaster: '0xF83F534153358AD6643B358AC3953f6467d5DAe7',
    claveProxy: '0x3b633b071ABFf838d30D1a326744D8277Fad468c',
    passkeyValidator: '0xDA63bBbc0A1a3F94e95c6bdd2DCB7B7112e3C635',
    accountFactory: '0x281d01350B4449D6F4B3a58ce7F342c5221E1636',
};

// SmartWallet SDKインスタンスを作成
export const sdk = new SmartWalletSDK({
  chainId: 300,
  contracts,
});

type BoxProps = {
    onPress: () => void;
    title: string;
    text: string;
    icon: ReactNode;
    isPending?: boolean;
};

/**
 * AuthView Component
 * @returns 
 */
export const AuthView = () => {
    /**
     * スマートウォレットをデプロイするメソッド
     */
    const deployAccount = async () => {
        // Prepare unique salt
        const salt = sdk.deployer.getSalt();

        console.log("salt", salt);

        // Calculate the smart account address
        const publicAddress = await sdk.deployer.getAddressForSalt(salt);

        console.log("publicAddress", publicAddress);

        // Create passkey
        const passkey = await sdk.webauthn.register(publicAddress);

        console.log("passkey", passkey);

        // Extract p256 public key from the passkey
        const publicKey = sdk.webauthn.getPublicKeyFromAuthenticatorData(
            passkey.authenticatorData
        );

        try {
            // Make deployment call: If status == 1, deployment is successful
            const { status } = await sdk.deployer.deploy(salt, publicKey);

            console.log("status", status);
        } catch (error) {
            console.error("error", error);
        }
    };

    const deployMutation = useMutation({
        mutationFn: deployAccount,
    });

    /**
     * 整体認証でウォレットにログインするメソッド
     */
    const loginAccount = async () => {
        const passkey = await sdk.webauthn.login();
        console.log("passkey", passkey);
    };

    const loginMutation = useMutation({
        mutationFn: loginAccount,
    });

    return (
        <div className="flex flex-1 justify-center items-center">
            <div className="container bg-slate-900 border-2 border-slate-800 w-[512px] min-h-[512px] max-w-[95vw] rounded-lg p-8 overflow-hidden">
                <p className="text-2xl text-white text-center mb-4">
                    ZKsync Smart Wallet Demo
                </p>
                <div className="space-y-4">
                    <Box
                        onPress={async () => {
                            await deployMutation.mutateAsync();
                        }}
                        icon={<FaUserPlus className="mr-2" size={32} />}
                        title="Create Smart Wallet"
                        text=" Start deploying your Smart Wallet on ZKsync"
                        isPending={deployMutation.isPending}
                    />

                    <Box
                        onPress={async () => {
                            await loginMutation.mutateAsync();
                        }}
                        icon={<FaArrowCircleRight className="mr-2" size={32} />}
                        title="Login Existing Wallet"
                        text={`Start using your existing Smart Wallet on ZKsync`}
                        isPending={loginMutation.isPending}
                    />
                </div>

                <p className="text-center text-white mt-4">
                    🩵 Made with one mission: to accelerate the onboarding of the
                    next billion to crypto.
                </p>
            </div>
        </div>
    );
};

const Box = ({
    onPress,
    title,
    text,
    icon,
    isPending = false,
}: BoxProps): ReactNode => {
    return (
        <button
            onClick={onPress}
            className="text-white flex flex-col items-center justify-center bg-slate-950 p-4 rounded-lg w-full border-2 border-slate-800 focus:border-blue-600 min-h-[180px]"
        >
            {isPending ? (
                <TailSpin speed={0.75} width={32} height={32} />
            ) : (
                icon
            )}
            <p className="text-xl mt-2">{title}</p>
            <p className="text-sm mt-2 text-gray-400">{text}</p>
        </button>
    );
};
