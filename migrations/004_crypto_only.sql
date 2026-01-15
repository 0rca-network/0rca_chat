-- Remove Razorpay-related tables (not needed for crypto-only flow)
-- The credits are now directly the devUSDC.e token balance in user's wallet

DROP TABLE IF EXISTS user_notification_reads CASCADE;
DROP TABLE IF EXISTS notification_recipients CASCADE;
DROP TABLE IF EXISTS user_credits CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- Keep notifications table for admin updates
-- Recreate notification reads table
CREATE TABLE IF NOT EXISTS user_notification_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(notification_id, wallet_address)
);

CREATE INDEX IF NOT EXISTS idx_user_notification_reads_wallet ON user_notification_reads(wallet_address);

-- Create subscriptions table for premium users
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'enterprise')),
    tx_hash TEXT, -- Transaction hash of the payment
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_wallet ON subscriptions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
