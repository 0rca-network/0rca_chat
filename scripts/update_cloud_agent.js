
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateAgent() {
    const newUrl = "https://agent-f98e422d.0rca.live";
    console.log(`Updating CloudAgent with new URL: ${newUrl}`);

    const { data, error } = await supabase
        .from('agents')
        .update({ inference_url: newUrl, status: 'active' })
        .eq('name', 'CloudAgent')
        .select();

    if (error) {
        console.error("Update error:", error);
    } else {
        console.log("Update success:", JSON.stringify(data, null, 2));
    }
}

updateAgent();
