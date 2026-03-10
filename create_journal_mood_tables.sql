-- Create Journals Table
CREATE TABLE journals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journals" ON journals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journals" ON journals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create Mood Logs Table
CREATE TABLE mood_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  mood TEXT NOT NULL,
  emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mood_logs" ON mood_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood_logs" ON mood_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
