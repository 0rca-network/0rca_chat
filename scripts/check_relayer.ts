import { ethers } from "ethers";

async function main() {
    const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org");
    const pk = "0x6fbb3fc07d0f7e30e45cf30b426af3e129672fb081538e6c26b715e26b4e59b0";
    const wallet = new ethers.Wallet(pk, provider);

    console.log(`Relayer Address: ${wallet.address}`);
    const balance = await provider.getBalance(wallet.address);
    console.log(`TCRO: ${ethers.formatEther(balance)}`);

    const usdc2 = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1"; // TestUSDC
    const abi = ["function balanceOf(address) view returns (uint256)"];
    const c2 = new ethers.Contract(usdc2, abi, provider);
    const b2 = await c2.balanceOf(wallet.address);
    console.log(`USDC.e: ${ethers.formatUnits(b2, 6)}`);
}

main().catch(console.error);
