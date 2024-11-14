import { CONFIG } from '@/utils/config';
import { Contract, ethers } from 'ethers';
import { Provider, types, Wallet } from 'zksync-ethers';

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY!;

const retry = async <T>(fn: () => Promise<T>, retries = 5) => {
    let retried = 0;

    while (retried < retries) {
        try {
            return await fn();
        } catch (e) {
            console.error(e);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            console.log(`Retrying... ${retried}`);
            retried++;
        }
    }
    throw new Error('Failed to execute function');
};

/**
 * AA用のスマートウォレットをデプロイするメソッド
 * @param request 
 * @returns 
 */
export async function POST(request: Request) {
    const body = await request.json();
    const { salt, initializer } = body;

    const SEPOLIA_RPC_URL = 'https://sepolia.era.zksync.dev';
    const MAINNET_RPC_URL = 'https://mainnet.era.zksync.io';

    // Providerインスタンスを生成
    const provider = new ethers.providers.JsonRpcProvider({
        skipFetchSetup: true,
        url: CONFIG.chainId === 324 ? MAINNET_RPC_URL : SEPOLIA_RPC_URL,
    });

    if (!DEPLOYER_PRIVATE_KEY) {
        return Response.json(
            {
                message: 'DEPLOYER_PRIVATE_KEY is not set',
            },
            {
                status: 500,
            },
        );
    }
    // デプロイヤーのウォレットインスタンスを生成
    const deployerWallet = new Wallet(
        DEPLOYER_PRIVATE_KEY,
        provider as Provider,
    );

    console.log("deployerWallet", deployerWallet.address);

    const factoryAddress = '0x48d25e2a7895390d0FE4f406D29Fdb8E705c4e03';

    // ファクトリーコントラクト インスタンスを生成
    const factoryContract = new Contract(
        factoryAddress,
        ['function deployAccount(uint256 salt, bytes initializer) public'],
        deployerWallet,
    );

    const deploymentFn = () => 
        // deployAccountメソッドを呼び出し
        factoryContract.deployAccount(salt, initializer, {
            // Provide manual gas limit
            gasLimit: 1000_000_000,
        });

    const tx = await retry<types.TransactionResponse>(deploymentFn);

    const receipt = await tx.wait();

    return Response.json(receipt);
}

export async function GET() {
    return Response.json({ status: 'ok' });
}
