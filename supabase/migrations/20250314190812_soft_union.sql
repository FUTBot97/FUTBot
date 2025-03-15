/*
  # Add subscription token and update schema

  1. Changes
    - Add token column to subscriptions table
    - Add expires_at column to subscriptions table
    - Add created_at column to subscriptions table with default value
    - Add unique constraint on email column
    - Add RLS policies for secure access

  2. Security
    - Enable RLS on subscriptions table
    - Add policies for:
      - Select: Allow authenticated users to read their own subscriptions
      - Insert: Allow authenticated admin users to create subscriptions
      - Update: Allow authenticated admin users to update subscriptions
      - Delete: Allow authenticated admin users to delete subscriptions
*/

-- Add new columns with safe migrations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'token'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN token text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN expires_at timestamp without time zone;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Add unique constraint on email if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'subscriptions' AND constraint_name = 'subscriptions_email_key'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_email_key UNIQUE (email);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for secure access
CREATE POLICY "Users can read own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Admins can create subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete subscriptions"
  ON subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');