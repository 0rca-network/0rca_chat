import { ethers } from "ethers";
import { GasStationClient } from "@kyuso/crogas";

const VAULT_ABI = [
    "function createTask(bytes32 taskId, uint256 amount) external",
    "function spend(bytes32 taskId, uint256 amount) external"
];

const USDC_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)"
];

export async function settleFundedTask(
    vaultAddress: string,
    taskId: string,
    amount: string
): Promise<string> {
    const privateKey = process.env.ORCHESTRATOR_PRIVATE_KEY;
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

    if (!privateKey || !rpcUrl) {
        throw new Error("Missing EVM configuration (ORCHESTRATOR_PRIVATE_KEY, NEXT_PUBLIC_RPC_URL)");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const vaultContract = new ethers.Contract(vaultAddress, VAULT_ABI, wallet);

    const amountUnits = ethers.parseUnits(amount, 6); // USDC has 6 decimals

    console.log(`[VaultClient] Settling Task ${taskId} on Vault ${vaultAddress}...`);
    const tx = await vaultContract.spend(taskId, amountUnits);
    await tx.wait();
    console.log(`[VaultClient] Task Settled (Spent): ${tx.hash}`);

    return tx.hash;
}

export async function settleFundedTaskWithGasStation(
    vaultAddress: string,
    taskId: string,
    amount: string
): Promise<string> {
    const privateKey = process.env.ORCHESTRATOR_PRIVATE_KEY;
    if (!privateKey) throw new Error("Missing ORCHESTRATOR_PRIVATE_KEY");

    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL!);
    const wallet = new ethers.Wallet(privateKey, provider);
    const amountUnits = ethers.parseUnits(amount, 6);

    console.log(`[VaultClient] (Gasless-Settle) Settling Task ${taskId} via Kyuso...`);

    const gas = new GasStationClient({
        apiUrl: "http://144.126.253.20",
        wallet: wallet,
        chainId: 338,
        usdcAddress: "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1"
    });

    const vaultInterface = new ethers.Interface(VAULT_ABI);
    const data = vaultInterface.encodeFunctionData("spend", [taskId, amountUnits]);

    const result = await gas.execute({
        to: vaultAddress,
        data: data,
        gasLimit: BigInt(200000)
    });

    if (!result.success) {
        throw new Error(`Kyuso Settle failed: ${result.txHash}`);
    }

    console.log(`[VaultClient] (Gasless-Settle) Success! Tx: ${result.txHash}`);
    return result.txHash;
}

export async function createFundedTask(
    vaultAddress: string,
    amount: string
): Promise<string> {
    const privateKey = process.env.ORCHESTRATOR_PRIVATE_KEY;
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    const usdcAddress = process.env.USDC_ADDRESS;

    if (!privateKey || !rpcUrl || !usdcAddress) {
        throw new Error("Missing EVM configuration (ORCHESTRATOR_PRIVATE_KEY, NEXT_PUBLIC_RPC_URL, USDC_ADDRESS)");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // 1. Generate Task ID
    const taskId = ethers.hexlify(ethers.randomBytes(32));
    console.log(`[VaultClient] Generated Task ID: ${taskId}`);

    // 2. Approve USDC
    const usdcContract = new ethers.Contract(usdcAddress, USDC_ABI, wallet);
    const amountUnits = ethers.parseUnits(amount, 6); // USDC has 6 decimals

    const currentAllowance = await usdcContract.allowance(wallet.address, vaultAddress);
    if (currentAllowance < amountUnits) {
        console.log(`[VaultClient] Approving USDC for Vault ${vaultAddress}...`);
        const tx = await usdcContract.approve(vaultAddress, amountUnits * BigInt(100)); // Approve 100x just in case
        await tx.wait();
        console.log(`[VaultClient] Approved.`);
    }

    // 3. Create Task
    const vaultContract = new ethers.Contract(vaultAddress, VAULT_ABI, wallet);
    console.log(`[VaultClient] Creating Task on Vault...`);
    const txTask = await vaultContract.createTask(taskId, amountUnits);
    await txTask.wait();
    console.log(`[VaultClient] Task Created: ${txTask.hash}`);

    return taskId;
}

export async function signPaymentChallenge(challenge: string): Promise<string> {
    const privateKey = process.env.ORCHESTRATOR_PRIVATE_KEY;
    if (!privateKey) throw new Error("Missing ORCHESTRATOR_PRIVATE_KEY");

    const wallet = new ethers.Wallet(privateKey);
    // x402 typically signs the raw challenge string
    const signature = await wallet.signMessage(challenge);

    // Return base64 encoded signature as expected by some SDKs
    // or just the hex signature. orca-agent-sdk expects base64 of the hex or 
    // simply the hex. Let's check server.py again if possible.
    // In server.py: signed_b64 = request.headers.get("X-PAYMENT")
    // If it's called 'signed_b64', it likely expects base64.

    return Buffer.from(signature).toString('base64');
}

export async function getUSDCBalance(accountAddress: string): Promise<string> {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    const usdcAddress = process.env.USDC_ADDRESS;

    if (!rpcUrl || !usdcAddress) {
        throw new Error("Missing EVM configuration (NEXT_PUBLIC_RPC_URL, USDC_ADDRESS)");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const usdcContract = new ethers.Contract(usdcAddress, USDC_ABI, provider);
    const balance = await usdcContract.balanceOf(accountAddress);

    return ethers.formatUnits(balance, 6);
}

export async function createFundedTaskFromSigner(
    vaultAddress: string,
    amount: string,
    signer: ethers.Signer,
    usdcAddress: string,
    existingTaskId?: string
): Promise<string> {
    // 1. Generate or use existing Task ID
    const taskId = existingTaskId || ethers.hexlify(ethers.randomBytes(32));
    console.log(`[VaultClient] (User) Using Task ID: ${taskId}`);

    // 2. Approve USDC
    const usdcContract = new ethers.Contract(usdcAddress, USDC_ABI, signer);
    const amountUnits = ethers.parseUnits(amount, 6);

    const userAddress = await signer.getAddress();
    const currentAllowance = await usdcContract.allowance(userAddress, vaultAddress);

    if (currentAllowance < amountUnits) {
        console.log(`[VaultClient] (User) Approving USDC for Vault ${vaultAddress}...`);
        const tx = await usdcContract.approve(vaultAddress, amountUnits * BigInt(100));
        await tx.wait();
        console.log(`[VaultClient] (User) Approved.`);
    }

    // 3. Create Task
    const vaultContract = new ethers.Contract(vaultAddress, VAULT_ABI, signer);
    console.log(`[VaultClient] (User) Creating Task on Vault...`);
    const txTask = await vaultContract.createTask(taskId, amountUnits);
    await txTask.wait();
    console.log(`[VaultClient] (User) Task Created: ${txTask.hash}`);

    return taskId;
}

export async function createFundedTaskFromSignerWithGasStation(
    vaultAddress: string,
    amount: string,
    signer: any, // Use any to allow Signer or Wallet
    usdcAddress: string,
    existingTaskId?: string
): Promise<string> {
    const taskId = existingTaskId || ethers.hexlify(ethers.randomBytes(32));
    const amountUnits = ethers.parseUnits(amount, 6);

    console.log(`[VaultClient] (User-CroGas) Using Task ID: ${taskId}`);

    // 1. Initialize Gas Station
    const gas = new GasStationClient({
        apiUrl: "http://144.126.253.20",
        wallet: signer,
        chainId: 338,
        usdcAddress: "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1" // CroGas Relayer uses tUSDC
    });

    // 2. Encode the createTask call
    const vaultInterface = new ethers.Interface(VAULT_ABI);
    const data = vaultInterface.encodeFunctionData("createTask", [taskId, amountUnits]);

    console.log(`[VaultClient] (User-CroGas) Executing gasless createTask...`);

    // 3. Execute via CroGas
    const result = await gas.execute({
        to: vaultAddress,
        data: data,
        gasLimit: BigInt(200000)
    });

    if (!result.success) {
        throw new Error(`CroGas execution failed: ${result.txHash}`);
    }

    console.log(`[VaultClient] (User-CroGas) Task Created! Tx: ${result.txHash}`);
    return taskId;
}

