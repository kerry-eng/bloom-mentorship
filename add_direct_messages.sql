-- Direct mentor <-> client messaging
-- Run this in your Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT direct_messages_sender_participant_check
    CHECK (sender_id = client_id OR sender_id = mentor_id)
);

CREATE INDEX IF NOT EXISTS direct_messages_client_mentor_created_idx
  ON public.direct_messages (client_id, mentor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS direct_messages_mentor_created_idx
  ON public.direct_messages (mentor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS direct_messages_client_created_idx
  ON public.direct_messages (client_id, created_at DESC);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view direct messages" ON public.direct_messages;
CREATE POLICY "Participants can view direct messages"
ON public.direct_messages
FOR SELECT
USING (auth.uid() = client_id OR auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Participants can send direct messages" ON public.direct_messages;
CREATE POLICY "Participants can send direct messages"
ON public.direct_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND (auth.uid() = client_id OR auth.uid() = mentor_id)
);

DROP POLICY IF EXISTS "Participants can update direct messages" ON public.direct_messages;
CREATE POLICY "Participants can update direct messages"
ON public.direct_messages
FOR UPDATE
USING (auth.uid() = client_id OR auth.uid() = mentor_id)
WITH CHECK (auth.uid() = client_id OR auth.uid() = mentor_id);
