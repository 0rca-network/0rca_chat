import { ethers } from "ethers";

async function main() {
    const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org");
    const vaultAddress = "0xe7bad567ed213efE7Dd1c31DF554461271356F30";
    const abi = ["function paymentToken() view returns (address)"];
    const vault = new ethers.Contract(vaultAddress, abi, provider);

    console.log("Vault Payment Token:", await vault.paymentToken());
}

main().catch(console.error);
