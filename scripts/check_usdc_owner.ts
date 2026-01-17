import { ethers } from "ethers";

async function main() {
    const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org");
    const usdcAddress = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1";
    const abi = ["function owner() view returns (address)"];
    const usdc = new ethers.Contract(usdcAddress, abi, provider);

    try {
        console.log("USDC Owner:", await usdc.owner());
    } catch (e) {
        console.log("No owner() function found");
    }
}

main().catch(console.error);
