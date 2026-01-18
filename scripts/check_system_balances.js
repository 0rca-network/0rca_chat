
const { ethers } = require('ethers');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const USDC_ABI = ["function balanceOf(address account) external view returns (uint256)"];
const USDC_ADDRESS = "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0";
const RPC_URL = "https://evm-t3.cronos.org";

async function checkAllBalances() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);

    const accounts = [
        { name: "Orchestrator", address: new ethers.Wallet(process.env.ORCHESTRATOR_PRIVATE_KEY).address },
        { name: "Vault", address: "0xe7bad567ed213efE7Dd1c31DF554461271356F30" },
        { name: "CloudAgent Identity", address: "0xbFbbb68118c4d790e4473bE6f24d70a49Fd9B3EC" }
    ];

    console.log("\n--- Current System Balances ---");
    for (const acc of accounts) {
        const usdcBal = await usdc.balanceOf(acc.address);
        const croBal = await provider.getBalance(acc.address);
        console.log(`${acc.name}:`);
        console.log(`  Address: ${acc.address}`);
        console.log(`  USDC: ${ethers.formatUnits(usdcBal, 6)}`);
        console.log(`  CRO: ${ethers.formatEther(croBal)}`);
    }
}

checkAllBalances();
