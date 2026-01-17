import { ethers } from "ethers";

async function main() {
    const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org");
    const orchestratorWallet = "0x975C5b75Ff1141E10c4f28454849894F766B945E";
    const agentWallet = "0xbFbbb68118c4d790e4473bE6f24d70a49Fd9B3EC";

    const usdc1 = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1"; // TestUSDC
    const usdc2 = "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0"; // USDC.e

    const abi = ["function balanceOf(address) view returns (uint256)"];

    const c1 = new ethers.Contract(usdc1, abi, provider);
    const c2 = new ethers.Contract(usdc2, abi, provider);

    console.log(`Orchestrator: ${orchestratorWallet}`);
    console.log(`  USDC (TestUSDC 0x38...): ${ethers.formatUnits(await c1.balanceOf(orchestratorWallet), 6)}`);
    console.log(`  USDC (USDC.e   0xc0...): ${ethers.formatUnits(await c2.balanceOf(orchestratorWallet), 6)}`);

    console.log(`\nAgent: ${agentWallet}`);
    console.log(`  USDC (TestUSDC 0x38...): ${ethers.formatUnits(await c1.balanceOf(agentWallet), 6)}`);
    console.log(`  USDC (USDC.e   0xc0...): ${ethers.formatUnits(await c2.balanceOf(agentWallet), 6)}`);
}

main().catch(console.error);
