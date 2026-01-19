
const { ethers } = require('ethers');

async function fundTarget() {
    const mnemonic = "dish public milk ramp capable venue poverty grain useless december hedgehog shuffle";
    const targetAddress = "0x0C679b59c792BE94BE6cfE5f5ED78C9ff3E9b38f";
    const usdcAddress = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1";
    const rpcUrl = "https://evm-t3.cronos.org";

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);

    console.log(`From Wallet: ${wallet.address}`);
    console.log(`Target Wallet: ${targetAddress}`);

    const usdcAbi = [
        "function transfer(address to, uint256 amount) external returns (bool)",
        "function balanceOf(address account) external view returns (uint256)"
    ];
    const usdc = new ethers.Contract(usdcAddress, usdcAbi, wallet);

    // Check balances
    const balance = await usdc.balanceOf(wallet.address);
    const croBalance = await provider.getBalance(wallet.address);
    console.log(`Current Wallet Balance: ${ethers.formatUnits(balance, 6)} tUSDC`);
    console.log(`Current Wallet CRO: ${ethers.formatEther(croBalance)} CRO`);

    if (balance < ethers.parseUnits("10", 6)) {
        console.error("Insufficient tUSDC balance in source wallet.");
        return;
    }

    console.log("Sending 10 tUSDC...");
    const tx = await usdc.transfer(targetAddress, ethers.parseUnits("10", 6));
    console.log(`Transaction Hash: ${tx.hash}`);

    await tx.wait();
    console.log("Success! Funds transferred.");

    const finalTargetBal = await usdc.balanceOf(targetAddress);
    console.log(`Target Final Balance: ${ethers.formatUnits(finalTargetBal, 6)} tUSDC`);
}

fundTarget().catch(console.error);
