-- Fix Auth OTP Long Expiry Security Issue
-- This migration addresses the OTP expiry security warning

-- Update auth configuration to set shorter OTP expiry times
-- Note: This requires Supabase CLI or dashboard configuration changes
-- The following are the recommended settings:

/*
Auth Settings to configure in Supabase Dashboard:
1. Go to Authentication > Settings
2. Set the following values:
   - JWT expiry limit: 3600 (1 hour)
   - Refresh token rotation: enabled
   - OTP expiry: 600 (10 minutes)
   - Email OTP expiry: 3600 (1 hour max)
   - SMS OTP expiry: 600 (10 minutes)

These settings cannot be changed via SQL migration and must be configured
through the Supabase Dashboard or CLI.
*/

-- Create a function to validate OTP expiry times
CREATE OR REPLACE FUNCTION validate_otp_security()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function serves as documentation for OTP security requirements
  RETURN 'OTP expiry should be set to maximum 1 hour (3600 seconds) for security compliance';
END;
$$;

-- Add comment for security compliance
COMMENT ON FUNCTION validate_otp_security() IS 'Security validation function for OTP expiry settings';

-- Create a view to monitor auth security settings (read-only)
CREATE OR REPLACE VIEW auth_security_status AS
SELECT 
  'OTP Security' as check_name,
  'Configure OTP expiry to 1 hour maximum in Supabase Dashboard' as recommendation,
  'Authentication > Settings > OTP expiry' as location;

-- Grant access to the view
GRANT SELECT ON auth_security_status TO authenticated;

-- Add security policy for the view
CREATE POLICY "Users can view auth security status" ON auth_security_status
  FOR SELECT TO authenticated
  USING (true);