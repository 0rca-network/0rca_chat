const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function insertAgent() {
    console.log("Inserting MySovereignAgent into Supabase...");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase environment variables.");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const agentData = {
        name: "MySovereignAgent",
        description: "A sovereign agent that uses the Sovereign Vault for x402 payments.",
        subdomain: "agent-7d95b47a", // The current deployed subdomain
    };

    // Check if exists
    const { data: existing } = await supabase
        .from('agents')
        .select('id')
        .eq('name', agentData.name);

    if (existing && existing.length > 0) {
        console.log(`Agent ${agentData.name} already exists. Updating...`);
        const { error } = await supabase
            .from('agents')
            .update(agentData)
            .eq('name', agentData.name);
        if (error) {
            console.error("Error updating agent:", error);
        } else {
            console.log("Agent updated successfully.");
        }
    } else {
        // Try to get a user_id
        const { data: users } = await supabase.from('users').select('id').limit(1);
        if (users && users.length > 0) {
            agentData.user_id = users[0].id;
        }

        console.log("Inserting new agent...");
        const { error } = await supabase.from('agents').insert([agentData]);
        if (error) {
            console.error("Error inserting agent:", error);
        } else {
            console.log("Agent inserted successfully.");
        }
    }
}

insertAgent();
