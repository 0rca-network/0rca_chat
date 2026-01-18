
const { ethers } = require("ethers");
const dotenv = require("dotenv");
const path = require("path");

// Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const VAULT_ABI = [
    "function createTask(bytes32 taskId, uint256 amount) external",
    "function spend(bytes32 taskId, uint256 amount) external"
];
const USDC_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)"
];

const AGENT_URL = "http://localhost:8002/agent";
const VAULT_ADDRESS = "0xe7bad567ed213efE7Dd1c31DF554461271356F30";

async function getBalances(provider, address) {
    const usdcAddress = process.env.USDC_ADDRESS;
    const usdc = new ethers.Contract(usdcAddress, USDC_ABI, provider);
    const orchBal = await usdc.balanceOf(address);
    const vaultBal = await usdc.balanceOf(VAULT_ADDRESS);
    return {
        orchestrator: ethers.formatUnits(orchBal, 6),
        vault: ethers.formatUnits(vaultBal, 6)
    };
}

async function createFundedTask(wallet, amount) {
    const usdcAddress = process.env.USDC_ADDRESS;
    const usdc = new ethers.Contract(usdcAddress, USDC_ABI, wallet);
    const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, wallet);

    // Check allownance
    const amountUnits = ethers.parseUnits(amount, 6);
    const allowance = await usdc.allowance(wallet.address, VAULT_ADDRESS);
    if (allowance < amountUnits) {
        console.log("Approving USDC...");
        const tx = await usdc.approve(VAULT_ADDRESS, ethers.MaxUint256);
        await tx.wait();
    }

    // Create Task
    const taskId = ethers.hexlify(ethers.randomBytes(32));
    console.log(`Creating Task ID: ${taskId}`);
    const tx = await vault.createTask(taskId, amountUnits);
    await tx.wait();
    return taskId;
}

async function settleTask(wallet, taskId, amount) {
    const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, wallet);
    const amountUnits = ethers.parseUnits(amount, 6);
    console.log(`Settling Task ${taskId}...`);
    const tx = await vault.spend(taskId, amountUnits);
    await tx.wait();
    console.log(`Task Settled: ${tx.hash}`);
}

async function main() {
    console.log("=== STARTING FULL FLOW TEST (STANDALONE) ===");

    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const wallet = new ethers.Wallet(process.env.ORCHESTRATOR_PRIVATE_KEY, provider);

    // 1. Initial Balances
    console.log("\n[1] Checking Initial Balances...");
    const initial = await getBalances(provider, wallet.address);
    console.log(`Orchestrator USDC: ${initial.orchestrator}`);
    console.log(`Vault USDC:       ${initial.vault}`);

    // 2. Fund Task (Simulating Orchestrator)
    console.log("\n[2] Funding Task...");
    const taskId = await createFundedTask(wallet, "0.1");

    // 3. Call Agent (First Attempt)
    console.log("\n[3] Calling Agent (Expect 402)...");
    const prompt = "Audit this contract.";

    const res1 = await fetch(AGENT_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-TASK-ID": taskId,
            "X-USER-ADDRESS": wallet.address
        },
        body: JSON.stringify({ prompt, taskId })
    });

    if (res1.status === 402) {
        console.log("Received 402 Payment Required (Success).");
        const challenge = res1.headers.get("PAYMENT-REQUIRED");

        // 4. Sign Challenge
        console.log("\n[4] Signing Challenge...");
        const userWallet = ethers.Wallet.createRandom(); // Simulated user
        console.log(`User: ${userWallet.address}`);
        const sig = await userWallet.signMessage(challenge);
        const b64Sig = Buffer.from(sig).toString('base64');

        // 5. Call Agent (Second Attempt)
        console.log("\n[5] Calling Agent with Signature...");
        const res2 = await fetch(AGENT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-TASK-ID": taskId,
                "X-USER-ADDRESS": userWallet.address,
                "X-PAYMENT": b64Sig
            },
            body: JSON.stringify({ prompt, taskId })
        });

        if (res2.status === 200) {
            const data = await res2.json();
            console.log("Agent Success!");
            console.log("Response Length:", JSON.stringify(data).length);

            // 6. Settle Task (Orchestrator Logic)
            console.log("\n[6] Settling Task (Orchestrator Logic)...");
            await settleTask(wallet, taskId, "0.1");

            // 7. Final Balances
            console.log("\n[7] Checking Final Balances...");
            const final = await getBalances(provider, wallet.address);
            console.log(`Orchestrator USDC: ${final.orchestrator} (diff: ${parseFloat(final.orchestrator) - parseFloat(initial.orchestrator)})`);
            console.log(`Vault USDC:       ${final.vault} (diff: ${parseFloat(final.vault) - parseFloat(initial.vault)})`);

        } else {
            console.error("Agent Failed on Retry:", res2.status, await res2.text());
        }

    } else {
        console.error("Expected 402, got:", res1.status);
    }
}

main();
