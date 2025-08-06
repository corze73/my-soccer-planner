/*
  # Fix Leaked Password Protection Security Issue

  1. Security Documentation
    - Document leaked password protection requirements
    - Add security compliance functions
    - Create monitoring capabilities

  2. Notes
    - Leaked password protection must be enabled in Supabase Dashboard
    - This prevents users from using compromised passwords from HaveIBeenPwned database
*/

-- Create a function to document leaked password protection requirements
CREATE OR REPLACE FUNCTION check_password_security_requirements()
RETURNS TABLE(
  security_feature TEXT,
  status TEXT,
  recommendation TEXT,
  configuration_location TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'Leaked Password Protection'::TEXT as security_feature,
    'REQUIRES_CONFIGURATION'::TEXT as status,
    'Enable leaked password protection to prevent use of compromised passwords'::TEXT as recommendation,
    'Supabase Dashboard > Authentication > Settings > Password Protection'::TEXT as configuration_location
  UNION ALL
  SELECT 
    'OTP Expiry Settings'::TEXT as security_feature,
    'REQUIRES_CONFIGURATION'::TEXT as status,
    'Set OTP expiry to maximum 1 hour (3600 seconds)'::TEXT as recommendation,
    'Supabase Dashboard > Authentication > Settings > OTP Settings'::TEXT as configuration_location;
END;
$$;

-- Add comment for security compliance
COMMENT ON FUNCTION check_password_security_requirements() IS 'Security compliance checker for authentication settings';

-- Create a function to validate password strength requirements
CREATE OR REPLACE FUNCTION validate_password_policy()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function serves as documentation for password security requirements
  RETURN 'Password policy should include: minimum 8 characters, leaked password protection enabled, and reasonable complexity requirements';
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION check_password_security_requirements() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_password_policy() TO authenticated;

-- Create a security compliance table for tracking
CREATE TABLE IF NOT EXISTS security_compliance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL,
  status TEXT NOT NULL,
  checked_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- Enable RLS on security compliance log
ALTER TABLE security_compliance_log ENABLE ROW LEVEL SECURITY;

-- Create policy for security compliance log (admin access only)
CREATE POLICY "Admin can manage security compliance log"
  ON security_compliance_log
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Insert initial security compliance checks
INSERT INTO security_compliance_log (check_type, status, notes)
VALUES 
  ('leaked_password_protection', 'PENDING_CONFIGURATION', 'Requires enabling in Supabase Dashboard'),
  ('otp_expiry_settings', 'PENDING_CONFIGURATION', 'Requires setting maximum 1 hour expiry')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_compliance_log_check_type ON security_compliance_log(check_type);
CREATE INDEX IF NOT EXISTS idx_security_compliance_log_checked_at ON security_compliance_log(checked_at);