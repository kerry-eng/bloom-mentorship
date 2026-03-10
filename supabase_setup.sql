-- Run this in your Supabase SQL Editor to set up the Mentorship Platform database

-- 1. Create Profiles Table (extends the built-in auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'mentor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profile Policies: Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT USING (auth.uid() = id);

-- Profile Policies: Mentors can read all profiles
CREATE POLICY "Mentors can view all profiles" 
ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mentor')
);

-- Profile Policies: Users can insert/update their own profile
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);


-- 2. Create Sessions Table (handles bookings)
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT NOT NULL,
  session_label TEXT NOT NULL,
  duration_mins INT NOT NULL,
  price INT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'active', 'completed')),
  stripe_payment_id TEXT, -- Used for Paystack reference as well
  daily_room_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Session Policies: Clients can view their own sessions
CREATE POLICY "Clients can view own sessions" 
ON sessions FOR SELECT USING (auth.uid() = client_id);

-- Session Policies: Mentors can view all sessions
CREATE POLICY "Mentors can view all sessions" 
ON sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mentor')
);

-- Session Policies: Clients can insert their own booking
CREATE POLICY "Clients can insert own sessions" 
ON sessions FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Session Policies: Mentors can update sessions (to add video URLs or mark complete)
CREATE POLICY "Mentors can update sessions" 
ON sessions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mentor')
);


-- 3. Set up the trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    'client'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- That's it! Your database is ready. 🌸
