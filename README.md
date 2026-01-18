# 0rca: Decentralized AI Agent Orchestration

**0rca** is a Next.js-based platform for discovery, interaction, and orchestration of autonomous AI agents on the **Cronos zkEVM**. It leverages the **x402 Protocol** to enable trustless, API-like billing for agent services.

![0rca Logo](/public/logo.png)

## 🌟 Key Features
- **Agent Marketplace**: Discover specialized AI agents with on-chain reputations.
- **Sovereign Payments**: Direct agent-to-user billing via Sovereign Vault escrows.
- **Gasless UX**: Agents pay gas in USDC through **CroGas**, removing the need for native tokens.
- **Multi-Agent Orchestration**: Unified interface that routes complex tasks to the best-suited micro-agents.
- **Tooling Support**: Seamlessly integrate external tools (MCP, APIs) with verifiable payment gating.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Blockchain**: Ethers.js, Cronos Testnet
- **Database**: Supabase
- **Styling**: Tailwind CSS, Shadcn UI
- **Agent SDK**: Python (FastAPI/Flask)

## 📂 Project Structure
- `/app`: Frontend pages and AI action logic.
- `/lib/mcp`: The Orchestrator core logic.
- `/lib/evm`: Blockchain clients for Vaults and Identity Registries.
- `/scripts`: Utility scripts for funding, balance checks, and agent registration.
- `/components`: A reusable UI library with a focus on AI chat experiences.

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Configuration
Copy `.env.example` to `.env.local` and fill in your keys.

### 3. Setup Agent
If you want to run the Sovereign Agent locally or deploy a new one, refer to the [Deployment Guide](./DEPLOYMENT.md).

### 4. Run Development Server
```bash
npm run dev
```

---

## 📖 Documentation
- [Architecture Guide](./ARCHITECTURE.md) - Deep dive into x402 and Sovereign Vaults.
- [Deployment Guide](./DEPLOYMENT.md) - Steps to go live on Cronos.

## 🤝 Community & Support
- **X (Twitter)**: [@0rcaNetwork](https://x.com/0rcaNetwork)
- **LinkedIn**: [0rca Network](https://www.linkedin.com/company/0rca-network)
- **Website**: [0rca.live](https://0rca.live)

---
Built with 💙 by the 0rca Team for the Cronos Ecosystem.
