/*
  # Initial Soccer Planner Database Schema

  1. New Tables
    - `profiles` - User profiles extending Supabase auth
    - `players` - Team players with positions and skills
    - `positions` - Available player positions
    - `formations` - Tactical formations
    - `formation_positions` - Positions within formations
    - `training_sessions` - Training sessions and matches
    - `session_activities` - Activities within sessions
    - `session_templates` - Reusable session templates
    - `template_activities` - Activities within templates

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  team_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create positions table
CREATE TABLE IF NOT EXISTS positions (
  id text PRIMARY KEY,
  name text NOT NULL,
  abbreviation text NOT NULL,
  color text NOT NULL DEFAULT '#1E88E5'
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  jersey_number integer NOT NULL,
  position_id text REFERENCES positions(id) NOT NULL,
  preferred_foot text CHECK (preferred_foot IN ('left', 'right', 'both')) DEFAULT 'right',
  skills text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, jersey_number)
);

-- Create formations table
CREATE TABLE IF NOT EXISTS formations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create formation_positions table
CREATE TABLE IF NOT EXISTS formation_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id uuid REFERENCES formations(id) ON DELETE CASCADE NOT NULL,
  position_id text REFERENCES positions(id) NOT NULL,
  x_position decimal(5,2) NOT NULL CHECK (x_position >= 0 AND x_position <= 100),
  y_position decimal(5,2) NOT NULL CHECK (y_position >= 0 AND y_position <= 100),
  player_id uuid REFERENCES players(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create session_templates table
CREATE TABLE IF NOT EXISTS session_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  duration integer NOT NULL DEFAULT 90,
  category text NOT NULL DEFAULT 'Training',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create template_activities table
CREATE TABLE IF NOT EXISTS template_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES session_templates(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  duration integer NOT NULL,
  description text,
  category text CHECK (category IN ('warmup', 'technical', 'tactical', 'physical', 'cooldown')) NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create training_sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  session_date date NOT NULL,
  duration integer NOT NULL DEFAULT 90,
  session_type text CHECK (session_type IN ('training', 'match')) DEFAULT 'training',
  notes text,
  template_id uuid REFERENCES session_templates(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create session_activities table
CREATE TABLE IF NOT EXISTS session_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES training_sessions(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  duration integer NOT NULL,
  description text,
  category text CHECK (category IN ('warmup', 'technical', 'tactical', 'physical', 'cooldown')) NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Insert default positions
INSERT INTO positions (id, name, abbreviation, color) VALUES
  ('gk', 'Goalkeeper', 'GK', '#FF6B35'),
  ('cb', 'Centre Back', 'CB', '#1E88E5'),
  ('lb', 'Left Back', 'LB', '#1E88E5'),
  ('rb', 'Right Back', 'RB', '#1E88E5'),
  ('cdm', 'Defensive Midfielder', 'CDM', '#43A047'),
  ('cm', 'Centre Midfielder', 'CM', '#43A047'),
  ('lm', 'Left Midfielder', 'LM', '#43A047'),
  ('rm', 'Right Midfielder', 'RM', '#43A047'),
  ('cam', 'Attacking Midfielder', 'CAM', '#43A047'),
  ('lw', 'Left Winger', 'LW', '#8E24AA'),
  ('rw', 'Right Winger', 'RW', '#8E24AA'),
  ('st', 'Striker', 'ST', '#E53935')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own players"
  ON players FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own formations"
  ON formations FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can manage own formation positions"
  ON formation_positions FOR ALL
  TO authenticated
  USING (formation_id IN (SELECT id FROM formations WHERE user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Users can manage own session templates"
  ON session_templates FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own template activities"
  ON template_activities FOR ALL
  TO authenticated
  USING (template_id IN (SELECT id FROM session_templates WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own training sessions"
  ON training_sessions FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own session activities"
  ON session_activities FOR ALL
  TO authenticated
  USING (session_id IN (SELECT id FROM training_sessions WHERE user_id = auth.uid()));

-- Everyone can read positions (they're reference data)
CREATE POLICY "Anyone can read positions"
  ON positions FOR SELECT
  TO authenticated
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_formations_updated_at BEFORE UPDATE ON formations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_templates_updated_at BEFORE UPDATE ON session_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_sessions_updated_at BEFORE UPDATE ON training_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();