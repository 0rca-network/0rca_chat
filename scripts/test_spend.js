const { ethers } = require('ethers');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

const VAULT_ABI = [
    "function createTask(bytes32 taskId, uint256 budget) external",
    "function spend(bytes32 taskId, uint256 amount) external",
    "function tasks(bytes32 taskId) view returns (uint256 budget, uint256 remaining, address creator, bool exists, bool closed)",
    "function accumulatedEarnings() view returns (uint256)"
];

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const wallet = new ethers.Wallet(process.env.ORCHESTRATOR_PRIVATE_KEY, provider);
    const vaultAddress = "0xe7bad567ed213efE7Dd1c31DF554461271356F30";

    const vault = new ethers.Contract(vaultAddress, VAULT_ABI, wallet);

    console.log("--- Test: Can Orchestrator Spend a Task? ---");

    const taskId = ethers.hexlify(ethers.randomBytes(32));
    const amount = ethers.parseUnits("0.05", 6);

    console.log(`Creating task ${taskId} with 0.05 USDC...`);
    try {
        const tx1 = await vault.createTask(taskId, amount);
        await tx1.wait();
        console.log("Task created.");

        console.log("Attempting to SPEND from the same Orchestrator wallet...");
        const tx2 = await vault.spend(taskId, amount);
        console.log("SENDING TX...");
        const receipt = await tx2.wait();
        console.log("SUCCESS! Orchestrator can call spend(). TX:", receipt.hash);

        const earnings = await vault.accumulatedEarnings();
        console.log("Vault Accumulated Earnings:", ethers.formatUnits(earnings, 6));
    } catch (e) {
        console.error("FAILED:", e.message);
    }
}

main();
