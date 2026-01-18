import { ethers } from "ethers";
import * as dotenv from "dotenv";
import path from "path";

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const VAULT_ABI = [
    "function createTask(bytes32 taskId, uint256 budget) external",
    "function spend(bytes32 taskId, uint256 amount) external",
    "function tasks(bytes32 taskId) view returns (uint256 budget, uint256 remaining, address creator, bool exists, bool closed)",
    "function accumulatedEarnings() view returns (uint256)"
];

const USDC_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) view returns (uint256)"
];

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const wallet = new ethers.Wallet(process.env.ORCHESTRATOR_PRIVATE_KEY!, provider);
    const vaultAddress = "0xe7bad567ed213efE7Dd1c31DF554461271356F30";
    const usdcAddress = process.env.USDC_ADDRESS!;

    const vault = new ethers.Contract(vaultAddress, VAULT_ABI, wallet);
    const usdc = new ethers.Contract(usdcAddress, USDC_ABI, wallet);

    console.log("--- Test: Can Orchestrator Spend a Task? ---");

    // 1. Create a task
    const taskId = ethers.hexlify(ethers.randomBytes(32));
    const amount = ethers.parseUnits("0.05", 6);

    console.log(`Creating task ${taskId} with 0.05 USDC...`);
    const tx1 = await vault.createTask(taskId, amount);
    await tx1.wait();
    console.log("Task created.");

    // 2. Try to spend it
    console.log("Attempting to SPEND from the same Orchestrator wallet...");
    try {
        const tx2 = await vault.spend(taskId, amount);
        console.log("SENDING TX...");
        const receipt = await tx2.wait();
        console.log("SUCCESS! Orchestrator can call spend(). TX:", receipt.hash);

        const earnings = await vault.accumulatedEarnings();
        console.log("Vault Accumulated Earnings:", ethers.formatUnits(earnings, 6));
    } catch (e: any) {
        console.error("FAILED to spend:", e.message);
    }
}

main();
