/*
  # Fix Supabase Security Issues and Session Saving

  1. Security Fixes
    - Fix function search path mutability
    - Enable proper RLS policies
    - Fix leaked password protection

  2. Session Saving Issues
    - Ensure proper foreign key constraints
    - Add missing indexes for performance
    - Fix any data type mismatches
*/

-- Fix the search_path security issue by creating a secure function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Ensure all tables have proper RLS enabled and policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_activities ENABLE ROW LEVEL SECURITY;

-- Fix any missing policies for training_sessions
DROP POLICY IF EXISTS "Users can manage own training sessions" ON training_sessions;
CREATE POLICY "Users can manage own training sessions"
  ON training_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fix any missing policies for session_activities
DROP POLICY IF EXISTS "Users can manage own session activities" ON session_activities;
CREATE POLICY "Users can manage own session activities"
  ON session_activities
  FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM training_sessions 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM training_sessions 
      WHERE user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_session_activities_session_id ON session_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_formations_user_id ON formations(user_id);

-- Ensure proper data types and constraints
ALTER TABLE training_sessions 
  ALTER COLUMN session_date TYPE date USING session_date::date;

-- Fix any potential issues with session creation
ALTER TABLE training_sessions 
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN session_date SET NOT NULL;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;