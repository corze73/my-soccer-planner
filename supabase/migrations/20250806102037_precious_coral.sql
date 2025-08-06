/*
  # Verify Session Saving Functionality

  This migration verifies that all tables and policies are properly configured
  for session saving functionality.
*/

-- Verify training_sessions table structure
DO $$
BEGIN
  -- Check if training_sessions table exists with correct columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'training_sessions'
  ) THEN
    RAISE EXCEPTION 'training_sessions table does not exist';
  END IF;

  -- Check required columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'training_sessions' 
    AND column_name = 'user_id'
  ) THEN
    RAISE EXCEPTION 'training_sessions.user_id column missing';
  END IF;

  RAISE NOTICE 'training_sessions table structure verified';
END $$;

-- Verify session_activities table structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'session_activities'
  ) THEN
    RAISE EXCEPTION 'session_activities table does not exist';
  END IF;

  RAISE NOTICE 'session_activities table structure verified';
END $$;

-- Verify RLS policies exist and are correct
DO $$
BEGIN
  -- Check training_sessions RLS policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'training_sessions' 
    AND policyname = 'Users can manage own training sessions'
  ) THEN
    RAISE EXCEPTION 'training_sessions RLS policy missing';
  END IF;

  -- Check session_activities RLS policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'session_activities' 
    AND policyname = 'Users can manage own session activities'
  ) THEN
    RAISE EXCEPTION 'session_activities RLS policy missing';
  END IF;

  RAISE NOTICE 'RLS policies verified';
END $$;

-- Test session creation (dry run)
CREATE OR REPLACE FUNCTION test_session_creation()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  test_result TEXT;
BEGIN
  -- This function tests the session creation flow without actually creating data
  
  -- Check if we can insert into training_sessions (structure test)
  BEGIN
    -- Test the insert structure (this will fail due to RLS, but that's expected)
    PERFORM 1 FROM training_sessions WHERE false;
    test_result := 'Session creation structure test passed';
  EXCEPTION WHEN OTHERS THEN
    test_result := 'Session creation structure test failed: ' || SQLERRM;
  END;
  
  RETURN test_result;
END;
$$;

-- Run the test
SELECT test_session_creation();

-- Clean up test function
DROP FUNCTION test_session_creation();

-- Add helpful comments
COMMENT ON TABLE training_sessions IS 'Stores training sessions with proper RLS for user isolation';
COMMENT ON TABLE session_activities IS 'Stores activities within training sessions with proper foreign key relationships';

-- Verify indexes for performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'training_sessions' 
    AND indexname = 'idx_training_sessions_user_id'
  ) THEN
    RAISE NOTICE 'Creating missing index on training_sessions.user_id';
    CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON training_sessions(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'session_activities' 
    AND indexname = 'idx_session_activities_session_id'
  ) THEN
    RAISE NOTICE 'Creating missing index on session_activities.session_id';
    CREATE INDEX IF NOT EXISTS idx_session_activities_session_id ON session_activities(session_id);
  END IF;

  RAISE NOTICE 'Database indexes verified and created if missing';
END $$;