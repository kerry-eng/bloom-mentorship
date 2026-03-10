-- ALLOW CLIENTS TO SEE MENTORS
-- Run this in your Supabase SQL Editor

CREATE POLICY "Anyone can view mentor profiles" 
ON profiles FOR SELECT 
USING (role = 'mentor');

-- Also ensure that bio and expertise are readable (they are part of the table, so the policy above covers them)
