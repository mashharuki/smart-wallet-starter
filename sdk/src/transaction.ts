import type { IPasskeySigner, TransactionProps } from '.';
import { parseHex, Webauthn } from '.';
import type { providers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import type { Provider, types } from 'zksync-ethers';
import { EIP712Signer, utils } from 'zksync-ethers';

export class Transaction {
    private webauthn: Webauthn;

    transaction: types.TransactionRequest;
    provider: Provider;
    signer: IPasskeySigner;
    validatorAddress: string;
    gaslessPaymasterAddress: string;

    constructor({
        transaction,
        provider,
        signer,
        validatorAddress,
        gaslessPaymasterAddress,
    }: TransactionProps) {
        this.transaction = transaction;
        this.provider = provider;
        this.signer = signer;
        this.validatorAddress = validatorAddress;
        this.gaslessPaymasterAddress = gaslessPaymasterAddress;
        this.webauthn = new Webauthn();
    }

    /**
     * @dev Sign the transaction and append the signature
     */
    public async sign(): Promise<string> {
        const signedTxHash = EIP712Signer.getSignedDigest(this.transaction);
        const message = parseHex(signedTxHash.toString());
        const signature = await this.signer.sign(
            this.webauthn.hexToBase64Url(message),
        );
        return defaultAbiCoder.encode(
            ['bytes', 'address', 'bytes[]'],
            [signature, this.validatorAddress, []],
        );
    }

    public appendPaymaster(): void {
        const transactionWithPaymaster: types.TransactionRequest = {
            ...this.transaction,
            customData: {
                ...this.transaction.customData,

                // Append gasless paymaster
                paymasterParams: utils.getPaymasterParams(
                    this.gaslessPaymasterAddress,
                    {
                        type: 'General',
                        innerInput: new Uint8Array(),
                    },
                ),
            },
        };
        this.transaction = transactionWithPaymaster;
    }

    /**
     * @dev Send the transaction
     */
    public async send(
        transaction: types.TransactionRequest,
    ): Promise<providers.TransactionReceipt> {
        console.log('Sending transaction', transaction);
        const sentTx = await this.provider.sendTransaction(
            utils.serialize(transaction),
        );
        const txReceipt = await sentTx.wait();
        return txReceipt;
    }

    /**
     * @dev Sign the transaction and send to the network
     */
    public async signAndSend(): Promise<providers.TransactionReceipt> {
        this.appendPaymaster();

        const signature = await this.sign();
        const newTx = {
            ...this.transaction,
            customData: {
                ...this.transaction.customData,
                customSignature: signature,
            },
        };
        this.transaction = newTx;
        return await this.send(newTx);
    }
}
