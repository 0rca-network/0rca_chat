-- Create payments table to store credit purchases
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount_inr INTEGER NOT NULL, -- Amount in paise
    credits INTEGER NOT NULL, -- Credits purchased
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- Create user_credits table to track credit balances
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    balance INTEGER DEFAULT 0,
    lifetime_purchased INTEGER DEFAULT 0,
    lifetime_used INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_wallet ON payments(wallet_address);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_wallet ON user_credits(wallet_address);

-- Function to add credits after payment verification
CREATE OR REPLACE FUNCTION add_credits(p_wallet_address TEXT, p_credits INTEGER)
RETURNS void AS $$
BEGIN
    INSERT INTO user_credits (wallet_address, balance, lifetime_purchased, updated_at)
    VALUES (p_wallet_address, p_credits, p_credits, NOW())
    ON CONFLICT (wallet_address) 
    DO UPDATE SET 
        balance = user_credits.balance + p_credits,
        lifetime_purchased = user_credits.lifetime_purchased + p_credits,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
