import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    try {
        const walletAddress = req.nextUrl.searchParams.get("wallet");

        if (!walletAddress) {
            return NextResponse.json(
                { error: "Wallet address is required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("user_credits")
            .select("*")
            .eq("wallet_address", walletAddress)
            .single();

        if (error && error.code !== "PGRST116") {
            // PGRST116 = no rows found (which is fine for new users)
            throw error;
        }

        return NextResponse.json({
            balance: data?.balance || 0,
            lifetime_purchased: data?.lifetime_purchased || 0,
            lifetime_used: data?.lifetime_used || 0,
        });
    } catch (error: any) {
        console.error("Get credits error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch credits" },
            { status: 500 }
        );
    }
}
