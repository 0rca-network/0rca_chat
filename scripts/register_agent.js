
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

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
    const agentName = "SecurityAuditor";
    const agentData = {
        name: agentName,
        description: "A specialized agent for smart contract security audits and vulnerability analysis.",
        configuration: {
            role: "Security Auditor",
            goal: "Analyze smart contracts and system architectures for vulnerabilities. Be thorough, paranoid, and technical.",
            backstory: "You are a specialized Security Auditor agent."
        },
        subdomain: "agent-security",
    };

    // Check if exists
    const { data: existing } = await supabase
        .from("agents")
        .select("id")
        .eq("name", agentName)
        .single();

    let result;
    if (existing) {
        console.log(`Updating existing agent ${existing.id}...`);
        const { data, error } = await supabase
            .from("agents")
            .update(agentData)
            .eq("id", existing.id)
            .select();
        result = { data, error };
    } else {
        console.log("Creating new agent...");
        const { data, error } = await supabase
            .from("agents")
            .insert(agentData)
            .select();
        result = { data, error };
    }

    if (result.error) {
        console.error("Error registering agent:", result.error);
    } else {
        console.log("Agent registered successfully:", result.data);
    }
}

registerAgent();
