"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupabaseClient = createSupabaseClient;
const supabase_js_1 = require("@supabase/supabase-js");
function createSupabaseClient() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    if (!url || !key) {
        throw new Error("Missing Supabase credentials in environment variables.");
    }
    return (0, supabase_js_1.createClient)(url, key);
}
