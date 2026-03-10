-- Update Database Schema for Multi-Mentor Support

-- 1. Add is_super_admin and bio/expertise to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS expertise TEXT[],
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Set the owner as super admin
UPDATE profiles 
SET is_super_admin = true, role = 'mentor' 
WHERE email = 'gloriakerubo@gmail.com';

-- 3. Add mentor_id to sessions
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES profiles(id);

-- 4. Update the bypass function to handle super admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role = 'mentor' OR is_super_admin = true)
  );
$$;

-- 5. Update RLS Policies for Sessions
-- Drop existing mentor policies
DROP POLICY IF EXISTS "Mentors can view all sessions" ON sessions;
DROP POLICY IF EXISTS "Mentors can update sessions" ON sessions;

-- Policy: Mentors see their own assigned sessions OR if they are super admin
CREATE POLICY "Mentors can view assigned or all sessions" 
ON sessions FOR SELECT 
USING (
  (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
  OR mentor_id = auth.uid()
);

-- Policy: Mentors can update assigned or all sessions
CREATE POLICY "Mentors can update assigned or all sessions" 
ON sessions FOR UPDATE 
USING (
  (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true
  OR mentor_id = auth.uid()
);

-- 6. Ensure mentors can see profile details of clients for their sessions
-- (Existing "Mentors can view all profiles" already uses public.is_admin())
