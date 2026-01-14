-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hash TEXT UNIQUE NOT NULL,
    wallet_address TEXT NOT NULL,
    title TEXT DEFAULT 'New Chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for wallet_address to speed up sidebar fetching
CREATE INDEX IF NOT EXISTS idx_chats_wallet_address ON chats(wallet_address);

-- Fix for agents table (if needed based on user request)
-- If chain_agent_id is null, it might be because it's not being populated during creation.
-- This migration ensures the column exists.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='chain_agent_id') THEN
        ALTER TABLE agents ADD COLUMN chain_agent_id TEXT;
    END IF;
END $$;

-- Populate chain_agent_id with id if it's null (Fix for user request)
UPDATE agents SET chain_agent_id = id::text WHERE chain_agent_id IS NULL;

