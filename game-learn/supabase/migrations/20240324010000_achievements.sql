-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  requirements JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index on category
CREATE INDEX IF NOT EXISTS achievements_category_idx ON public.achievements(category);

-- Add achievement_id column to user_achievements if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_achievements' 
    AND column_name = 'achievement_id'
  ) THEN
    ALTER TABLE public.user_achievements ADD COLUMN achievement_id VARCHAR(50);
  END IF;
END $$;

-- Add icon and points columns to user_achievements if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_achievements' 
    AND column_name = 'icon'
  ) THEN
    ALTER TABLE public.user_achievements ADD COLUMN icon VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_achievements' 
    AND column_name = 'points'
  ) THEN
    ALTER TABLE public.user_achievements ADD COLUMN points INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create user_statistics table
CREATE TABLE IF NOT EXISTS public.user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  lessons_completed INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  highest_quiz_score INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index on user_id
CREATE INDEX IF NOT EXISTS user_statistics_user_id_idx ON public.user_statistics(user_id);

-- Create or replace function to update user statistics
CREATE OR REPLACE FUNCTION update_user_statistics()
RETURNS TRIGGER AS $$
DECLARE
  stats_record RECORD;
BEGIN
  -- Check if a record exists for this user
  SELECT * INTO stats_record FROM public.user_statistics WHERE user_id = NEW.user_id;
  
  IF NOT FOUND THEN
    -- Create a new record
    INSERT INTO public.user_statistics (
      user_id, 
      score, 
      current_streak,
      longest_streak,
      last_activity_date,
      updated_at
    )
    VALUES (
      NEW.user_id,
      NEW.score,
      NEW.max_streak,
      NEW.max_streak,
      NEW.updated_at,
      now()
    );
  ELSE
    -- Update existing record
    UPDATE public.user_statistics
    SET 
      score = NEW.score,
      current_streak = NEW.max_streak,
      longest_streak = GREATEST(NEW.max_streak, stats_record.longest_streak),
      last_activity_date = NEW.updated_at,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on leaderboard table for stat updates
DROP TRIGGER IF EXISTS on_leaderboard_update_stats ON public.leaderboard;
CREATE TRIGGER on_leaderboard_update_stats
AFTER INSERT OR UPDATE ON public.leaderboard
FOR EACH ROW
EXECUTE FUNCTION update_user_statistics();

-- Insert default achievements
INSERT INTO public.achievements (id, name, description, icon, category, display_order, points, requirements)
VALUES
  ('first_lesson', 'First Steps', 'Complete your first lesson', 'footprints', 'progress', 1, 10, '{"lessons_completed": 1}'),
  ('streak_7', 'Weekly Warrior', 'Maintain a 7-day streak', 'fire', 'streaks', 2, 50, '{"streak_days": 7}'),
  ('streak_30', 'Monthly Master', 'Maintain a 30-day streak', 'fire', 'streaks', 3, 200, '{"streak_days": 30}'),
  ('score_1000', 'Point Collector', 'Earn 1,000 points', 'trophy', 'score', 4, 25, '{"min_score": 1000}'),
  ('score_5000', 'High Scorer', 'Earn 5,000 points', 'trophy', 'score', 5, 100, '{"min_score": 5000}'),
  ('perfect_quiz', 'Perfect Score', 'Get 100% on any quiz', 'star', 'quizzes', 6, 30, '{"quiz_score": 100}'),
  ('social_butterfly', 'Social Butterfly', 'Add 5 friends', 'users', 'social', 7, 40, '{"friends_count": 5}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  display_order = EXCLUDED.display_order,
  points = EXCLUDED.points,
  requirements = EXCLUDED.requirements; 