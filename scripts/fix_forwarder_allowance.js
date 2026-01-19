
const { ethers } = require('ethers');

async function approveForwarderForVault() {
    const rpcUrl = "https://evm-t3.cronos.org";
    const forwarderAddress = "0x523D5F604788a9cFC74CcF81F0DE5B3b5623635F";
    const vaultAddress = "0x4d7fcfE642eDc67cEBe595d1D74E7349A55C3222";
    const usdcAddress = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1";

    // Orchestrator key to sign the meta-tx
    const privateKey = "63918bb7d149f6cc03b40aeff33aff6da1736a1fe1f479f0da95e694698f69dc";

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    const forwarderAbi = [
        "function getNonce(address from) view returns (uint256)",
        "function execute(tuple(address from, address to, uint256 value, uint256 gas, uint256 nonce, uint256 deadline, bytes data) req, bytes signature) public payable returns (bool, bytes)"
    ];

    const usdcAbi = [
        "function approve(address spender, uint256 amount) external returns (bool)"
    ];

    const forwarder = new ethers.Contract(forwarderAddress, forwarderAbi, wallet);
    const usdcInterface = new ethers.Interface(usdcAbi);

    const nonce = await forwarder.getNonce(wallet.address);
    const deadline = Math.floor(Date.now() / 1000) + 3600;

    // Data for USDC approve
    const data = usdcInterface.encodeFunctionData("approve", [vaultAddress, ethers.MaxUint256]);

    const request = {
        from: wallet.address,
        to: usdcAddress,
        value: 0,
        gas: 100000,
        nonce: nonce,
        deadline: deadline,
        data: data
    };

    const domain = {
        name: "MinimalForwarder",
        version: "1",
        chainId: 338,
        verifyingContract: forwarderAddress
    };

    const types = {
        ForwardRequest: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "gas", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
            { name: "data", type: "bytes" }
        ]
    };

    console.log("Signing meta-transaction to make Forwarder approve Vault...");
    const signature = await wallet.signTypedData(domain, types, request);

    console.log("Executing transaction...");
    const tx = await forwarder.execute(request, signature, { gasLimit: 200000 });
    console.log("Tx Hash:", tx.hash);

    await tx.wait();
    console.log("Forwarder has now approved Vault for USDC!");
}

approveForwarderForVault().catch(console.error);
