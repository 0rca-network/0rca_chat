import { createSupabaseClient } from "../lib/mcp/clients/supabase";
import * as dotenv from "dotenv";
import path from "path";

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
    console.log("Registering Agent...");
    try {
        const supabase = createSupabaseClient();
        const agentName = "MySovereignAgent";

        // Check if exists
        const { data: existing } = await supabase
            .from("agents")
            .select("id")
            .eq("name", agentName)
            .single();

        if (existing) {
            console.log(`Agent ${agentName} already exists: ${existing.id}`);
            return;
        }

        // Fetch a user ID first
        const { data: userData } = await supabase.from('users').select('id').limit(1).single();
        // If users table not accessible via client, try auth.users? No, client can't select auth schema directly easily.
        // Let's try to just use a hardcoded UUID or rely on the previous failure hint. 
        // Actually, let's just add subdomain first.

        const agent = {
            name: agentName,
            description: "A sovereign agent that requires payment via OrcaAgentVault.",
            subdomain: "my-sovereign-agent",
            // system_prompt column might not exist, relying on Orchestrator fallback or different column
        };

        const { data, error } = await supabase.from("agents").insert([agent]).select().single();

        if (error) {
            console.error("Error inserting agent:", error);
        } else {
            console.log("Agent inserted successfully:", data);
        }
    } catch (e) {
        console.error("Script failed:", e);
    }
}

main();
