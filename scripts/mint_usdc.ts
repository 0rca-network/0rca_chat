import { ethers } from "ethers";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function main() {
    const rpcUrl = "https://evm-t3.cronos.org";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const orchestratorPk = "0x6fbb3fc07d0f7e30e45cf30b426af3e129672fb081538e6c26b715e26b4e59b0";
    if (!orchestratorPk) return;

    const wallet = new ethers.Wallet(orchestratorPk, provider);
    const usdcAddress = "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0";

    const abi = ["function mint(address to, uint256 amount) public"];
    const usdc = new ethers.Contract(usdcAddress, abi, wallet);

    console.log("Attempting to mint 1000 USDC for Orchestrator...");
    try {
        const tx = await usdc.mint(wallet.address, ethers.parseUnits("1000", 6));
        console.log("Mint transaction sent:", tx.hash);
        await tx.wait();
        console.log("Mint successful!");
    } catch (e) {
        console.error("Mint failed:", e);
    }
}

main().catch(console.error);
