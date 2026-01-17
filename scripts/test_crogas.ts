import { Wallet, JsonRpcProvider, ethers } from "ethers";
import { GasStation } from "@crogas/sdk";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Use the API URL provided by the user
const CROGAS_URL = "http://144.126.253.20";
const CHAIN_ID = 338; // Cronos Testnet

async function main() {
    console.log("Testing CroGas SDK Integration...");

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://evm-t3.cronos.org";
    const provider = new JsonRpcProvider(rpcUrl);

    // Use orchestrator wallet for testing (it has USDC)
    const pk = process.env.ORCHESTRATOR_PRIVATE_KEY;
    if (!pk) {
        console.error("ORCHESTRATOR_PRIVATE_KEY not set");
        return;
    }

    const wallet = new Wallet(pk, provider);
    console.log("Wallet address:", wallet.address);

    // Initialize Gas Station
    const gas = new GasStation({
        apiUrl: CROGAS_URL,
        wallet,
        chainId: CHAIN_ID,
    });

    try {
        // Example: Check estimate for a simple call
        console.log("Fetching estimate for a dummy transaction...");
        const to = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1"; // USDC contract
        const data = "0x"; // Just a check

        const estimate = await gas.estimate(to, data);
        console.log("Estimate received:", estimate);
        console.log("Price in USDC:", estimate.priceUSDC);

        // If we wanted to execute:
        // const result = await gas.execute({ to, data });
        // console.log("Result:", result);

        console.log("SDK Integration Verified Successfully!");
    } catch (error) {
        console.error("Test failed:", error);
    }
}

main().catch(console.error);
