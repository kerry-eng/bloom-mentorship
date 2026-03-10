-- Add reflection columns to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS take_homes TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS actionables TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS key_insights TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS challenges TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS next_steps TEXT;

-- Policy to allow clients to update their own session reflections
-- We drop it first to avoid "already exists" errors if the script is re-run
DROP POLICY IF EXISTS "Clients can update own session reflections" ON sessions;

CREATE POLICY "Clients can update own session reflections" 
ON sessions FOR UPDATE USING (auth.uid() = client_id);
