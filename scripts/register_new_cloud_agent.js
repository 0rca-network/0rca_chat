
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const agent = {
        name: "CloudAgent",
        description: "Freshly deployed cloud agent on Kubernetes.",
        subdomain: "agent-9886e0fe",
        configuration: {
            role: "Cloud Assistant",
            goal: "Help users with cloud tasks",
            backstory: "I am running on the 0rca Kubernetes cluster."
        }
    };

    console.log("Registering CloudAgent...");
    const { data, error } = await supabase.from("agents").insert([agent]).select().single();

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Success:", data);
    }
}

main();
