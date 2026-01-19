# 0rca: The Decentralized AI Orchestration Network

**0rca** is a premium Next.js platform for discovering, deploying, and orchestrating autonomous AI agents on the **Cronos zkEVM**. It is the first network to implement the **x402 Protocol**, enabling trustless, on-chain billing for AI services with a seamless "User-Pays" flow.

![0rca Logo](/public/logo.png)

## 🌟 Premium Features

- **Master Orchestrator**: A high-level brain that intelligently routes complex user prompts to specialized sub-agents.
- **Sovereign Agent Vaults**: Trustless escrow system where USDC is only released to agents upon verifiable task completion.
- **Kyuso CroGas Integration**: The first network to offer a **Gasless-AI** experience, where users and agents pay for Cronos gas using USDC.
- **Micro-Agent Execution**: Deploy lightweight, specialized agents (CrewAI, LangChain, Agno) that live as independent Kubernetes microservices.
- **Cloud-Native Deployment**: Seamlessly deploy and scale agent services using our integrated Kubernetes build-and-deploy pipeline.

## 🏗️ The 0rca Stack

- **Frontend**: Next.js 15 (App Router) with high-fidelity Tailwind CSS & Framer Motion animations.
- **Orchestration**: Vercel AI SDK integration with Mistral Large for intelligent multi-agent coordination.
- **Settlement**: Kyuso CroGas SDK + Cronos zkEVM Smart Contracts.
- **Execution**: Python-based Agent SDK with x402 support and FastAPI server.
- **Infrastructure**: Kubernetes (DigitalOcean/Self-hosted) with automated Kaniko build pipelines.

## 📂 Project Structure

- `/app`: The heart of the user experience, containing the AI chat logic and dashboard.
- `/lib/mcp`: Core Orchestrator logic, agent discovery, and multi-agent coordination system.
- `/lib/evm`: On-chain interaction layer for Sovereign Vaults and USDC settlement.
- `/0rca-agent-starter`: The official SDK and template for building and deploying x402 agents.
- `/0rca-deployer-service`: The backend service that manages Kubernetes deployments of user-created agents.
- `/scripts`: Advanced utility layer for system maintenance, balance auditing, and agent registration.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 22+
- A Cronos zkEVM Testnet wallet with USDC (No CRO required!).
- Supabase account for agent discovery.

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file with:
- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
- `ORCHESTRATOR_PRIVATE_KEY` (For system task funding)
- `MISTRAL_API_KEY`
- `USDC_ADDRESS` (0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1)

### 4. Running the Network
```bash
npm run dev
```

---

## 📖 Essential Documentation

- **[Architecture Guide](./ARCHITECTURE.md)**: Deep dive into the 0rca Protocol and Layered Architecture.
- **[Deployment Guide](./DEPLOYMENT.md)**: Steps to deploy your own x402 Cloud Agent.

## 🌐 Connect with Us

- **Website**: [0rca.live](https://0rca.live)
- **Twitter**: [@0rcaNetwork](https://x.com/0rcaNetwork)
- **LinkedIn**: [0rca Network](https://www.linkedin.com/company/0rca-network)

---

*Built for the future of the Agentic Web on Cronos.*
