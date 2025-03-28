-- Create score history table to track player progress over time
CREATE TABLE IF NOT EXISTS public.score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Add metadata
  source VARCHAR(50), -- e.g., 'quiz', 'challenge', 'lesson'
  metadata JSONB
);

-- Create index on user_id for score_history
CREATE INDEX IF NOT EXISTS score_history_user_id_idx ON public.score_history(user_id);
CREATE INDEX IF NOT EXISTS score_history_created_at_idx ON public.score_history(created_at);

-- Add completion_rate column to leaderboard if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leaderboard' 
    AND column_name = 'completion_rate'
  ) THEN
    ALTER TABLE public.leaderboard ADD COLUMN completion_rate INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add badges JSONB column to leaderboard if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leaderboard' 
    AND column_name = 'badges'
  ) THEN
    ALTER TABLE public.leaderboard ADD COLUMN badges JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create friends relationship table
CREATE TABLE IF NOT EXISTS public.user_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'blocked'
  
  -- Prevent duplicate friendship entries
  UNIQUE(user_id, friend_id)
);

-- Create indexes on user_friends
CREATE INDEX IF NOT EXISTS user_friends_user_id_idx ON public.user_friends(user_id);
CREATE INDEX IF NOT EXISTS user_friends_friend_id_idx ON public.user_friends(friend_id);

-- Create function to record score history when leaderboard is updated
CREATE OR REPLACE FUNCTION record_score_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new record into score_history
  INSERT INTO public.score_history (user_id, score, created_at)
  VALUES (NEW.user_id, NEW.score, now());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on leaderboard table
DROP TRIGGER IF EXISTS on_leaderboard_update ON public.leaderboard;
CREATE TRIGGER on_leaderboard_update
AFTER UPDATE OF score ON public.leaderboard
FOR EACH ROW
WHEN (NEW.score <> OLD.score)
EXECUTE FUNCTION record_score_history(); 