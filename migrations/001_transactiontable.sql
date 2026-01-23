
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  agent_id text,
  task_id text,
  amount numeric,
  token_symbol text DEFAULT 'USDC',
  type text CHECK (type = ANY (ARRAY['payment'::text, 'refund'::text, 'earning'::text])),
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text])),
  tx_hash text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id)
);

-- Index for faster lookups by wallet
CREATE INDEX idx_transactions_wallet ON public.transactions(wallet_address);
-- Index for lookups by task_id (useful for correlating payments)
CREATE INDEX idx_transactions_task_id ON public.transactions(task_id);
