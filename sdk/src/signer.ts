import { Webauthn } from './webauthn';
import type { BigNumber } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';

export interface IPasskeySigner {
    credentialId: string;
    sign: (data: string) => Promise<string>;
}

export class Signer implements IPasskeySigner {
    public readonly credentialId: string;
    private webauthn: Webauthn;
    private expectedClientDataPrefix: Buffer;

    constructor(credentialId: string) {
        this.webauthn = new Webauthn();
        this.credentialId = credentialId;
        this.expectedClientDataPrefix = this.webauthn.bufferFromString(
            '{"type":"webauthn.get","challenge":"',
        );
    }

    public async sign(data: string): Promise<string> {
        const { response } = await this.webauthn.authenticate(
            [this.credentialId],
            data,
        );

        const authenticatorDataBuffer = this.webauthn.bufferFromBase64url(
            response.authenticatorData,
        );
        const clientDataBuffer = this.webauthn.bufferFromBase64url(
            response.clientDataJSON,
        );
        const rs = this.webauthn.getRS(response.signature);

        return this.encodeSigature(
            authenticatorDataBuffer,
            clientDataBuffer,
            rs,
        );
    }

    private encodeSigature(
        authenticatorData: Buffer,
        clientData: Buffer,
        rs: Array<BigNumber>,
    ): string {
        let clientDataSuffix = clientData
            .subarray(this.expectedClientDataPrefix.length, clientData.length)
            .toString();

        const quoteIndex = clientDataSuffix.indexOf('"');
        clientDataSuffix = clientDataSuffix.slice(quoteIndex);

        return defaultAbiCoder.encode(
            ['bytes', 'string', 'bytes32[2]'],
            [authenticatorData, clientDataSuffix, rs],
        );
    }
}
