import { ethers } from "ethers";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function main() {
    const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org");
    const orchestratorWallet = "0x975C5b75Ff1141E10c4f28454849894F766B945E";

    const usdc1 = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1"; // TestUSDC
    const usdc2 = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1"; // USDC.e

    const abi = ["function balanceOf(address) view returns (uint256)"];

    const c1 = new ethers.Contract(usdc1, abi, provider);
    const c2 = new ethers.Contract(usdc2, abi, provider);

    const b1 = await c1.balanceOf(orchestratorWallet);
    const b2 = await c2.balanceOf(orchestratorWallet);

    console.log(`Orchestrator: ${orchestratorWallet}`);
    console.log(`USDC (TestUSDC): ${ethers.formatUnits(b1, 6)}`);
    console.log(`USDC (USDC.e): ${ethers.formatUnits(b2, 6)}`);
}

main().catch(console.error);
