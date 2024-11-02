import { getChainProvider } from './provider';
import type { ContractInterface } from 'ethers';
import type { Provider, Wallet } from 'zksync-ethers';
import { Contract } from 'zksync-ethers';
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
    batchCaller: '0x1513dB8DdC9420728bFb2830AE6784B26Ac9bf25',
    implementation: '0x5627beD3bA7DFc5D9DbAa0122A52C7F22a2DD4D3',
    registry: '0x7f273AF2576EA32309c32c9bae2b609B6e4484aC',
    gaslessPaymaster: '0xF83F534153358AD6643B358AC3953f6467d5DAe7',
    claveProxy: '0x3b633b071ABFf838d30D1a326744D8277Fad468c',
    passkeyValidator: '0xDA63bBbc0A1a3F94e95c6bdd2DCB7B7112e3C635',
    accountFactory: '0x281d01350B4449D6F4B3a58ce7F342c5221E1636',
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
