import { ethers } from "ethers";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function main() {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://evm-t3.cronos.org";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const orchestratorPk = process.env.ORCHESTRATOR_PRIVATE_KEY;
    const agentAddress = "0xbFbbb68118c4d790e4473bE6f24d70a49Fd9B3EC";
    const usdcAddress = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1";

    if (orchestratorPk) {
        const wallet = new ethers.Wallet(orchestratorPk, provider);
        const orchestratorBalance = await provider.getBalance(wallet.address);
        console.log(`Orchestrator (${wallet.address}) Balance: ${ethers.formatEther(orchestratorBalance)} TCRO`);

        const usdc = new ethers.Contract(usdcAddress, [
            "function balanceOf(address) view returns (uint256)",
            "function transfer(address to, uint256 value) returns (bool)"
        ], provider);

        const orchUsdc = await usdc.balanceOf(wallet.address);
        console.log(`Orchestrator USDC Balance: ${ethers.formatUnits(orchUsdc, 6)} USDC`);

        const agentBalance = await provider.getBalance(agentAddress);
        console.log(`Agent (${agentAddress}) Balance: ${ethers.formatEther(agentBalance)} TCRO`);

        const agentUsdc = await usdc.balanceOf(agentAddress);
        console.log(`Agent USDC Balance: ${ethers.formatUnits(agentUsdc, 6)} USDC`);

        const vaultUsdc = await usdc.balanceOf("0xe7bad567ed213efE7Dd1c31DF554461271356F30");
        console.log(`Vault USDC Balance: ${ethers.formatUnits(vaultUsdc, 6)} USDC`);

        if (orchestratorBalance > ethers.parseEther("0.5")) {
            if (orchUsdc > ethers.parseUnits("5", 6) && agentUsdc < ethers.parseUnits("1", 6)) {
                console.log("Sending 5 USDC to Agent for CroGas payments...");
                const tx = await (usdc.connect(wallet) as any).transfer(agentAddress, ethers.parseUnits("5", 6));
                console.log(`USDC Transfer sent: ${tx.hash}`);
                await tx.wait();
                console.log("USDC Transfer confirmed.");
            }
        }
    } else {
        console.log("ORCHESTRATOR_PRIVATE_KEY not set.");
    }
}

main().catch(console.error);
