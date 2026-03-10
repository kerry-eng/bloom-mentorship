-- RUN THIS IN THE SUPABASE SQL EDITOR TO ADD PERSONALIZATION COLUMNS

-- Add personalization columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light',
ADD COLUMN IF NOT EXISTS initial_mood TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS music_preference TEXT DEFAULT 'ambient',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Comment to verify
COMMENT ON TABLE profiles IS 'Mentorship platform profiles with personalization data.';
