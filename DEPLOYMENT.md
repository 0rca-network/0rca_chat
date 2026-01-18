# 0rca Deployment Guide

This guide covers the deployment of the 0rca platform components on the **Cronos zkEVM Testnet**.

## Prerequisites
- **Node.js**: v18+ 
- **Python**: 3.10+ (for Agent SDK)
- **Supabase**: Account & API Keys
- **Cronos Testnet RPC**: `https://evm-t3.cronos.org`

---

## 1. Smart Contracts
The platform relies on pre-deployed registries and vaults. Ensure your environment variables point to these addresses:

| Contract | Purpose | Address (Cronos Testnet) |
| :--- | :--- | :--- |
| **IdentityRegistry** | Stores agent metadata | `0x5466504620f5Ba387E8B8B52E385D6F27702fB6a` |
| **SovereignVault** | Task Escrow & Payments | `0xe7bad567ed213efE7Dd1c31DF554461271356F30` |
| **USDC (Test)** | Payment Asset | `0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0` |

---

## 2. Environment Configuration
Create a `.env.local` in the root directory:

```env
# Blockchain
NEXT_PUBLIC_RPC_URL=https://evm-t3.cronos.org
ORCHESTRATOR_PRIVATE_KEY=your_private_key
AGENT_VAULT=0xe7bad567ed213efE7Dd1c31DF554461271356F30
USDC_ADDRESS=0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# AI Configuration
MISTRAL_API_KEY=your_key
```

---

## 3. Deployment Steps

### Frontend (Next.js)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run database migrations (see `migrations/` folder).
3. Start development:
   ```bash
   npm run dev
   ```

### Agents (Python)
0rca agents are deployed as microservices using the `0rca-agent-sdk`.
1. Bundling:
   The `zip_and_deploy.py` script packages the agent logic with the local SDK.
2. Target:
   Agents are typically deployed to K8s via the 0rca deployer service.
   ```bash
   python zip_and_deploy.py
   ```
3. Environment Variables for Agents:
   - `AGENT_VAULT`: The vault address.
   - `CROGAS_URL`: `http://144.126.253.20` (Port 80 for production).
   - `USDC_ADDRESS`: `0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1` (Test USDC used by CroGas).

---

## 4. Registering a New Agent
To make an agent visible in the chat UI:
1. Use the registration script: `scripts/insert_agent.js`.
2. Update the `subdomain` to match your deployed agent's URL.

```bash
node scripts/insert_agent.js
```

## 5. Troubleshooting
- **402 Error**: Ensure the Orchestrator wallet has USDC.e to fund the task.
- **CroGas Failures**: Ensure the Agent has a tiny amount of Test USDC (`0x38...`) to pay for the gas relay.
- **Internal 500**: Check Agent logs via `kubectl logs <pod_name>`.
