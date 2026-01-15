-- Create notifications table for admin-pushed updates
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'update')),
    icon TEXT DEFAULT 'bell', -- Icon name from lucide-react
    link TEXT, -- Optional link to navigate to
    is_global BOOLEAN DEFAULT true, -- If true, shown to all users; if false, check notification_recipients
    created_by TEXT, -- Admin wallet address who created this
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ -- Optional expiration date
);

-- Create notification_recipients table for targeted notifications
CREATE TABLE IF NOT EXISTS notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_notification_reads table to track which global notifications users have read
CREATE TABLE IF NOT EXISTS user_notification_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(notification_id, wallet_address)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_wallet ON notification_recipients(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_notification_reads_wallet ON user_notification_reads(wallet_address);

-- Insert some sample notifications (can be removed in production)
INSERT INTO notifications (title, message, type, icon) VALUES
    ('Welcome to 0RCA!', 'Start chatting with our AI agents to explore the platform.', 'info', 'bot'),
    ('New Feature: Auto Orchestrator', 'Let AI automatically select the best agents for your task.', 'update', 'sparkles'),
    ('System Maintenance', 'Scheduled maintenance on Jan 20th, 2026 at 2:00 AM UTC.', 'warning', 'alert-circle')
ON CONFLICT DO NOTHING;
