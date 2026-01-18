
const { ethers } = require("ethers");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
    const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org");
    const pk = process.env.ORCHESTRATOR_PRIVATE_KEY;
    if (!pk) throw new Error("Missing PK");

    const wallet = new ethers.Wallet(pk, provider);
    const agentWallet = "0xbFbbb68118c4d790e4473bE6f24d70a49Fd9B3EC";

    console.log(`Funding Agent ${agentWallet} from ${wallet.address}...`);
    const tx = await wallet.sendTransaction({
        to: agentWallet,
        value: ethers.parseEther("5.0")
    });
    console.log(`Transaction sent: ${tx.hash}`);
    await tx.wait();
    console.log("Success!");
}

main().catch(console.error);
