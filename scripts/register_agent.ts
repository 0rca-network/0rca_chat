
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase configuration.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function registerAgent() {
    const agentData = {
        name: "SecurityAuditor",
        description: "A specialized agent for smart contract security audits and vulnerability analysis.",
        system_prompt: "You are a specialized Security Auditor agent. Your goal is to analyze smart contracts and system architectures for vulnerabilities. You are thorough, paranoid, and technical.",
        subdomain: "agent-security", // Checks orchestrator for endpoint logic
        // Note: The orchestrator uses subdomain to construct URL: https://${agent.subdomain}.0rca.live/agent
        // BUT for local testing we might need to adjust Orchestrator or run this on a real URL.
        // For now, let's assume valid subdomain format. 
        // Wait, the orchestrator logic handles "MySovereignAgent" specially or uses subdomain. 
        // To test LOCALLY, we might need to modify Orchestrator to support localhost ports for specific agents.
    };

    // For local testing, we might want to hacking the Orchestrator to route this agent to localhost:8002 
    // or we just register it and let the user prompt.
    // However, the production Orchestrator expects https URL. 
    // Let's confusingly set subdomain for now, but also we might need to add a "local_port" field or similar if we want to test locally without deploying.
    // But the requirements say "deploy a new agent". 
    // If I cannot deploy to 0rca.live, I must rely on the Orchestrator being able to hit localhost if running locally.

    // Let's insert.
    const { data, error } = await supabase
        .from("agents")
        .upsert(agentData, { onConflict: "name" })
        .select();

    if (error) {
        console.error("Error registering agent:", error);
    } else {
        console.log("Agent registered successfully:", data);
    }
}

registerAgent();
