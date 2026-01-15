import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            walletAddress,
        } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: "Missing payment details" },
                { status: 400 }
            );
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            // Update payment status to failed
            await supabase
                .from("payments")
                .update({ status: "failed" })
                .eq("razorpay_order_id", razorpay_order_id);

            return NextResponse.json(
                { error: "Invalid payment signature" },
                { status: 400 }
            );
        }

        // Get payment record
        const { data: payment, error: fetchError } = await supabase
            .from("payments")
            .select("*")
            .eq("razorpay_order_id", razorpay_order_id)
            .single();

        if (fetchError || !payment) {
            return NextResponse.json(
                { error: "Payment record not found" },
                { status: 404 }
            );
        }

        // Update payment record
        const { error: updateError } = await supabase
            .from("payments")
            .update({
                razorpay_payment_id,
                razorpay_signature,
                status: "paid",
                verified_at: new Date().toISOString(),
            })
            .eq("razorpay_order_id", razorpay_order_id);

        if (updateError) {
            console.error("Update error:", updateError);
        }

        // Add credits to user's balance
        const { error: creditError } = await supabase.rpc("add_credits", {
            p_wallet_address: payment.wallet_address,
            p_credits: payment.credits,
        });

        if (creditError) {
            // Fallback: Direct insert/update if RPC fails
            const { data: existing } = await supabase
                .from("user_credits")
                .select("*")
                .eq("wallet_address", payment.wallet_address)
                .single();

            if (existing) {
                await supabase
                    .from("user_credits")
                    .update({
                        balance: existing.balance + payment.credits,
                        lifetime_purchased: existing.lifetime_purchased + payment.credits,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("wallet_address", payment.wallet_address);
            } else {
                await supabase.from("user_credits").insert({
                    wallet_address: payment.wallet_address,
                    balance: payment.credits,
                    lifetime_purchased: payment.credits,
                });
            }
        }

        return NextResponse.json({
            success: true,
            credits: payment.credits,
            message: `Successfully added ${payment.credits} credits!`,
        });
    } catch (error: any) {
        console.error("Verify payment error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to verify payment" },
            { status: 500 }
        );
    }
}
