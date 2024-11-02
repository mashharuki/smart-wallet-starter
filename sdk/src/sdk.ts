import { Core, Deployer, Multicall, Webauthn } from '.';
import type { InitOptions } from './types';

type SmartWalletSDKOptions = {
    apiUrl?: string;
} & InitOptions;

export class SmartWalletSDK {
    public core: Core;
    public deployer: Deployer;
    public multicall: Multicall;
    public webauthn: Webauthn;

    constructor(options: SmartWalletSDKOptions) {
        const _options = { ...options } as Required<SmartWalletSDKOptions>;
        if (_options.apiUrl == null) {
            _options.apiUrl = 'http://localhost:3000';
        }

        this.core = new Core(_options);
        this.deployer = new Deployer(_options);
        this.multicall = new Multicall(_options);

        this.webauthn = new Webauthn();
    }
}
