import { ethers } from "ethers";

async function main() {
    const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org");
    const abi = [
        "function name() view returns (string)",
        "function version() view returns (string)",
        "function nonces(address) view returns (uint256)"
    ];

    const u1 = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1";
    const u2 = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1";

    const c1 = new ethers.Contract(u1, abi, provider);
    const c2 = new ethers.Contract(u2, abi, provider);

    console.log("Checking USDC 1 (0x38...):");
    try {
        console.log("Name:", await c1.name());
    } catch (e) { }
    try {
        console.log("Version:", await c1.version());
    } catch (e) { }

    console.log("\nChecking USDC 2 (0xc0e...):");
    try {
        console.log("Name:", await c2.name());
    } catch (e) { }
    try {
        console.log("Version:", await c2.version());
    } catch (e) { }
}

main().catch(console.error);
