
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getData() {
    console.log("Fetching agents...");
    const { data: agents, error: agentError } = await supabase
        .from('agents')
        .select('*');

    if (agentError) {
        console.error("Agent error:", agentError);
    } else {
        console.log("Agents:", JSON.stringify(agents, null, 2));
    }

    console.log("\nFetching access tokens...");
    const { data: tokens, error: tokenError } = await supabase
        .from('access_tokens')
        .select('*');

    if (tokenError) {
        console.error("Token error:", tokenError);
    } else {
        console.log("Tokens found:", tokens.length);
        if (tokens.length > 0) {
            console.log("First token name:", tokens[0].name);
            console.log("First token value (hashed?):", tokens[0].token_hash);
        }
    }
}

getData();
