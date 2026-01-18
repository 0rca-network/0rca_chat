
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectAgents() {
    const { data, error } = await supabase
        .from("agents")
        .select("*")
        .limit(1);

    if (error) {
        console.error("Error fetching agents:", error);
    } else {
        console.log("Existing Agent Structure:", JSON.stringify(data[0], null, 2));
    }
}

inspectAgents();
