import axios, { AxiosInstance } from 'axios';
import { abiFactory } from './abi';
import { SmartContract } from './contract';
import { parseHex } from './string';
import { BigNumber, ethers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { Contract } from 'zksync-ethers';
import { InitOptions } from './types';
import { Buffer } from 'buffer';

type DeployerOptions = {
    apiUrl: string;
} & InitOptions;

type InitCallType = {
    target: string;
    allowFailure: boolean;
    value: BigNumber;
    callData: string;
};

type DeployParams = {
    salt: string;
    initializer: string;
};

export class Deployer {
    private contract: SmartContract;
    private factoryContract: Contract;
    private axiosInstance: AxiosInstance;

    constructor({ apiUrl, ...options }: DeployerOptions) {
        this.contract = SmartContract.create(options);
        this.factoryContract = this.contract.getContract(
            'accountFactory',
            abiFactory,
        );
        this.axiosInstance = axios.create({
            baseURL: apiUrl,
        });
    }

    public static create(options: DeployerOptions): Deployer {
        return new Deployer(options);
    }

    public getSalt(): string {
        return ethers.utils.sha256(Buffer.from(ethers.utils.randomBytes(32)));
    }

    public async getAddressForSalt(salt: string): Promise<string> {
        const address = await this.factoryContract.getAddressForSalt(salt);
        return address;
    }

    public async deploy(salt: string, publicKey: string) {
        const deployParams = this.getDeploymentParams(salt, publicKey);
        const { data } = await this.axiosInstance.post('/api/deploy', {
            deployParams,
        });
        return data;
    }

    private getDeploymentParams = (
        salt: string,
        publicKey: string,
    ): DeployParams => {
        const emptyCall: InitCallType = {
            target: ethers.constants.AddressZero,
            allowFailure: false,
            value: BigNumber.from(0),
            callData: '0x',
        };
        const modules: Array<string> = [];

        const SELECTOR = '0x77ba2e75';
        const CALLDATA = defaultAbiCoder.encode(
            [
                'bytes',
                'address',
                'bytes[]',
                'tuple(address target,bool allowFailure,uint256 value,bytes calldata)',
            ],
            [
                publicKey,
                this.contract.passkeyValidator,
                modules,
                [
                    emptyCall.target,
                    emptyCall.allowFailure,
                    emptyCall.value,
                    emptyCall.callData,
                ],
            ],
        );

        const initializer = SELECTOR.concat(parseHex(CALLDATA));

        return {
            salt,
            initializer,
        };
    };
}
