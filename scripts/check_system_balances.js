
const { ethers } = require('ethers');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const USDC_ABI = ["function balanceOf(address account) external view returns (uint256)"];
const USDC_ADDRESS = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1";
const RPC_URL = "https://evm-t3.cronos.org";

async function checkAllBalances() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);

    const accounts = [
        { name: "Orchestrator", address: new ethers.Wallet(process.env.ORCHESTRATOR_PRIVATE_KEY).address },
        { name: "Vault", address: "0xe7bad567ed213efE7Dd1c31DF554461271356F30" },
        { name: "CloudAgent Identity", address: "0xbFbbb68118c4d790e4473bE6f24d70a49Fd9B3EC" },
        { name: "Agent Signer (Hot Wallet)", address: "0x0C679b59c792BE94BE6cfE5f5ED78C9ff3E9b38f" }
    ];

    console.log("\n--- Unified System Balance Audit (tUSDC) ---");
    console.log("Token: tUSDC (0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1)");
    console.log("Network: Cronos Testnet (338)");
    console.log("------------------------------------------");

    for (const acc of accounts) {
        try {
            const usdcBal = await usdc.balanceOf(acc.address);
            const croBal = await provider.getBalance(acc.address);

            console.log(`${acc.name}:`);
            console.log(`  Address:  ${acc.address}`);
            console.log(`  USDC:     ${ethers.formatUnits(usdcBal, 6)}`);
            console.log(`  CRO:      ${ethers.formatEther(croBal)}`);
            console.log("");
        } catch (e) {
            console.error(`Error checking ${acc.name}:`, e.message);
        }
    }
}

checkAllBalances();
