-- FIX FOR INFINITE RECURSION IN RLS POLICIES

-- 1. Create a function that bypasses RLS to check mentor status safely
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'mentor'
  );
$$;

-- 2. Drop the old recursive policies on profiles
DROP POLICY IF EXISTS "Mentors can view all profiles" ON profiles;

-- 3. Recreate the policy using the safe function
CREATE POLICY "Mentors can view all profiles" 
ON profiles FOR SELECT USING ( public.is_admin() );

-- 4. Drop the old recursive policies on sessions
DROP POLICY IF EXISTS "Mentors can view all sessions" ON sessions;
DROP POLICY IF EXISTS "Mentors can update sessions" ON sessions;

-- 5. Recreate them using the safe function
CREATE POLICY "Mentors can view all sessions" 
ON sessions FOR SELECT USING ( public.is_admin() );

CREATE POLICY "Mentors can update sessions" 
ON sessions FOR UPDATE USING ( public.is_admin() );
