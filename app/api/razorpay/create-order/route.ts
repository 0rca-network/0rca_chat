import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Credit pricing: 1 credit = $1 = ~83 INR (approximate rate)
const USD_TO_INR = 83;

// Razorpay API base URL
const RAZORPAY_API = "https://api.razorpay.com/v1";

async function createRazorpayOrder(options: {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
}) {
    const auth = Buffer.from(
        `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    const response = await fetch(`${RAZORPAY_API}/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(options),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.description || "Failed to create order");
    }

    return response.json();
}

export async function POST(req: NextRequest) {
    try {
        const { credits, walletAddress } = await req.json();

        if (!credits || !walletAddress) {
            return NextResponse.json(
                { error: "Credits and wallet address are required" },
                { status: 400 }
            );
        }

        if (credits < 10) {
            return NextResponse.json(
                { error: "Minimum 10 credits required" },
                { status: 400 }
            );
        }

        // Calculate amount in INR (paise)
        const amountUSD = credits; // 1 credit = $1
        const amountINR = amountUSD * USD_TO_INR;
        const amountPaise = Math.round(amountINR * 100);

        // Create Razorpay order
        const order = await createRazorpayOrder({
            amount: amountPaise,
            currency: "INR",
            receipt: `credits_${Date.now()}`,
            notes: {
                credits: credits.toString(),
                wallet_address: walletAddress,
            },
        });

        // Store order in database
        const { error: dbError } = await supabase.from("payments").insert({
            wallet_address: walletAddress,
            razorpay_order_id: order.id,
            amount_inr: amountPaise,
            credits: credits,
            status: "created",
        });

        if (dbError) {
            console.error("Database error:", dbError);
        }

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            credits: credits,
            amountINR: amountINR,
        });
    } catch (error: any) {
        console.error("Create order error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create order" },
            { status: 500 }
        );
    }
}
