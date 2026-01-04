
import dotenv from "dotenv";
import { createSupabaseClient } from "./src/clients/supabase.js";

dotenv.config();

async function inspectAgents() {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from("agents").select("*");

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Agents found:", JSON.stringify(data, null, 2));
    }
}

inspectAgents();
