import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Target, Mail, Lock, User, Users } from 'lucide-react';

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await signUp(email, password);
        if (error) throw error;
        
        // Create profile with additional info if signup was successful
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              full_name: fullName,
              team_name: teamName
            });
          
          if (profileError) {
            // If profile creation fails, sign out the user to prevent inconsistent state
            await supabase.auth.signOut();
            throw profileError;
          }
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        // Ensure profile exists after sign-in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
          
          if (!existingProfile) {
            // Create profile if it doesn't exist
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || email,
                full_name: null,
                team_name: null
              });
            
            if (profileError) {
              await supabase.auth.signOut();
              throw profileError;
            }
          }
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Target className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Soccer Planner</h1>
          <p className="text-gray-600">Professional training & tactical planning</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your team name"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your password"
                required
                minLength={6}
                onFocus={() => setShowPasswordRequirements(true)}
                onBlur={() => setShowPasswordRequirements(false)}
              />
            </div>
            {showPasswordRequirements && isSignUp && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                <p className="font-medium text-blue-900 mb-1">Password Requirements:</p>
                <ul className="text-blue-800 space-y-1">
                  <li>• Minimum 6 characters (8+ recommended)</li>
                  <li>• Avoid common passwords</li>
                  <li>• Mix of letters, numbers, and symbols</li>
                  <li>• Not found in data breaches</li>
                </ul>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Enhanced Security Information */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowSecurityInfo(!showSecurityInfo)}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showSecurityInfo ? 'Hide' : 'Show'} Security Information
          </button>
          {showSecurityInfo && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
              <p className="mb-2">🔒 <strong>Current Security Features:</strong></p>
              <ul className="text-left space-y-1">
                <li>• Secure password authentication</li>
                <li>• Session timeout protection</li>
                <li>• Encrypted data transmission</li>
                <li>• Row-level security enabled</li>
              </ul>
              
              <div className="mt-3 pt-2 border-t border-blue-200">
                <p className="mb-1">⚠️ <strong>Security Recommendations:</strong></p>
                <ul className="text-left space-y-1 text-blue-700">
                  <li>• Enable leaked password protection</li>
                  <li>• Configure OTP expiry (max 1 hour)</li>
                  <li>• Use strong, unique passwords</li>
                  <li>• Enable two-factor authentication</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* Admin Security Notice */}
        <div className="mt-2 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
            <span className="text-xs text-yellow-800">
              Admin: Configure security settings in Supabase Dashboard
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;