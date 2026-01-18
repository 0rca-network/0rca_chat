
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanupAgents() {
    console.log("Cleaning up agents table...");

    // Deleting all agents EXCEPT CloudAgent
    const { data: killed, error } = await supabase
        .from('agents')
        .delete()
        .not('name', 'eq', 'CloudAgent');

    if (error) {
        console.error("Error deleting agents:", error);
    } else {
        console.log("Cleanup complete. All agents except 'CloudAgent' have been removed.");
    }

    // Verify
    const { data: remaining } = await supabase.from('agents').select('*');
    console.log("Remaining agents:", remaining.map(a => a.name));
}

cleanupAgents();
