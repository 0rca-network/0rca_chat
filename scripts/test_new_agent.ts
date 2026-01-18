
import { executeOrchestration } from "../app/actions";
import * as dotenv from "dotenv";
import path from "path";

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Disable SSL check for self-signed certs (e.g. staging deploy)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function main() {
    console.log("Testing New Agent Integration...");
    try {
        const prompt = "Please perform a security audit of the vault contract.";
        const mode = "auto";
        const selectedAgentIds: string[] = [];

        console.log(`Prompt: "${prompt}"`);
        const result = await executeOrchestration(prompt, mode, selectedAgentIds);

        console.log("\n--- RESULT ---");
        console.log(result);
        console.log("--------------");

    } catch (e) {
        console.error("Test failed:", e);
    }
}

main();
