import { ethers } from "ethers";

async function main() {
    const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org");
    const relayerPk = "0x6fbb3fc07d0f7e30e45cf30b426af3e129672fb081538e6c26b715e26b4e59b0";
    const wallet = new ethers.Wallet(relayerPk, provider);

    const usdcAddress = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1";
    const agentAddress = "0xbFbbb68118c4d790e4473bE6f24d70a49Fd9B3EC";

    const abi = ["function transfer(address to, uint256 amount) returns (bool)"];
    const usdc = new ethers.Contract(usdcAddress, abi, wallet);

    console.log(`Transferring 0.01 USDC (0x38...) from Relayer to Agent...`);
    try {
        const tx = await usdc.transfer(agentAddress, 10000); // 0.01 USDC
        console.log("Tx hash:", tx.hash);
        await tx.wait();
        console.log("Success!");
    } catch (e) {
        console.error("Transfer failed:", e);
    }
}

main().catch(console.error);
