import { defaultContracts } from '../contract';
import { SmartWalletSDK } from '../sdk';

jest.mock('@passwordless-id/webauthn', () => jest.fn());

describe('SDK', () => {
    let sdk: SmartWalletSDK;

    beforeAll(() => {
        sdk = new SmartWalletSDK({
            chainId: 300,
            contracts: defaultContracts,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be initialized correctly', async () => {
        expect(sdk.core).toBeDefined();
        expect(sdk.webauthn).toBeDefined();
        expect(sdk.multicall).toBeDefined();
        expect(sdk.deployer).toBeDefined();
    });

    it('should have a valid core implementation', async () => {
        expect((await sdk.core.getProvider().getNetwork()).chainId).toBe(300);
    });
});
