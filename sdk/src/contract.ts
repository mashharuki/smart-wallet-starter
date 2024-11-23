import type { ContractInterface } from 'ethers';
import type { Provider, Wallet } from 'zksync-ethers';
import { Contract } from 'zksync-ethers';
import { getChainProvider } from './provider';
import type { InitOptions } from './types';

type ContractName =
    | 'batchCaller'
    | 'implementation'
    | 'registry'
    | 'gaslessPaymaster'
    | 'claveProxy'
    | 'passkeyValidator'
    | 'accountFactory';

export const defaultContracts: Record<string, string> = {
    batchCaller: '0x2Df65b433Cde5ddf121e86327f63CF81926afe5c',
    implementation: '0x8B2d3Fb7a4557765a56b0b1b658419F70CF3F974',
    registry: '0xc5FF3D69f65275577F3dd7622C132d1FA5C23E8d',
    gaslessPaymaster: '0x620524C8B2A2c24FEaD175F07377a66d9DC8EccA',
    claveProxy: '0x076ecaFAfa75b9f963F93277f0Ca5d6469a4CfD9',
    passkeyValidator: '0xcfa2A796140668e9878e708B5E050A335DC474F7',
    accountFactory: '0x59cA0733496E8f56d83850b91fe50790DE6a003B',
};

export class SmartContract {
    private readonly provider: Provider;
    batchCaller: string;
    implementation: string;
    registry: string;
    gaslessPaymaster: string;
    claveProxy: string;
    passkeyValidator: string;
    accountFactory: string;

    constructor({ contracts, chainId }: InitOptions) {
        this.provider = getChainProvider(chainId);
        this.batchCaller = contracts.batchCaller;
        this.implementation = contracts.implementation;
        this.registry = contracts.registry;
        this.gaslessPaymaster = contracts.gaslessPaymaster;
        this.claveProxy = contracts.claveProxy;
        this.passkeyValidator = contracts.passkeyValidator;
        this.accountFactory = contracts.accountFactory;
    }

    public static create(options: InitOptions): SmartContract {
        return new SmartContract(options);
    }

    /**
     * Getting a specific contract instance
     */
    public getContract(contractName: ContractName, abi: ContractInterface) {
        return new Contract(this[contractName], abi, this.provider);
    }

    /**
     * Getting a specific contract instance with EOA signer
     */
    public getContractWithEOASigner(
        contractName: ContractName,
        abi: ContractInterface,
        wallet: Wallet,
    ) {
        return new Contract(this[contractName], abi, wallet);
    }
}
