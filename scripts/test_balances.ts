import { getUSDCBalance, createFundedTask } from "../lib/evm/vaultClient";
import * as dotenv from "dotenv";
import path from "path";
import { ethers } from "ethers";

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
    const orchAddress = new ethers.Wallet(process.env.ORCHESTRATOR_PRIVATE_KEY!).address;
    const vaultAddress = "0xe7bad567ed213efE7Dd1c31DF554461271356F30";

    console.log("--- Starting Balance Check ---");
    try {
        const orchBalance = await getUSDCBalance(orchAddress);
        const vaultBalance = await getUSDCBalance(vaultAddress);
        console.log(`Orchestrator (${orchAddress}) USDC: ${orchBalance}`);
        console.log(`Vault (${vaultAddress}) USDC: ${vaultBalance}`);
    } catch (e: any) {
        console.error("Failed to fetch balances:", e.message);
    }

    console.log("\n--- Testing Task Funding ---");
    try {
        console.log("Attempting to create a funded task (0.1 USDC)...");
        const taskId = await createFundedTask(vaultAddress, "0.1");
        console.log(`SUCCESS! Task Created with ID: ${taskId}`);

        const newOrchBalance = await getUSDCBalance(orchAddress);
        const newVaultBalance = await getUSDCBalance(vaultAddress);
        console.log(`New Orchestrator USDC: ${newOrchBalance}`);
        console.log(`New Vault USDC: ${newVaultBalance}`);
    } catch (e: any) {
        console.error("Funding failed:", e.message);
    }
}

main();
