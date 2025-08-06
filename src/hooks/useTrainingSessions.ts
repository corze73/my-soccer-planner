import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { sessionTemplates } from '../data/sessionTemplates';

export interface TrainingSession {
  id: string;
  user_id: string;
  title: string;
  session_date: string;
  duration: number;
  session_type: 'training' | 'match';
  notes: string | null;
  template_id: string | null;
  created_at: string;
  updated_at: string;
  activities?: SessionActivity[];
  drills?: SessionDrill[];
}

export interface SessionActivity {
  id: string;
  session_id: string;
  name: string;
  duration: number;
  description: string | null;
  category: 'warmup' | 'technical' | 'tactical' | 'physical' | 'cooldown';
  order_index: number;
  created_at: string;
}

export interface SessionDrill {
  id: string;
  activity_id: string;
  name: string;
  description: string | null;
  category: string;
  diagram: any;
  created_at: string;
}

export function useTrainingSessions() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('training_sessions')
        .select(`
          *,
          activities:session_activities(*)
        `)
        .eq('user_id', user.id)
        .order('session_date', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (sessionData: {
    title: string;
    session_date: string;
    duration: number;
    session_type: 'training' | 'match';
    notes?: string;
    activities?: Activity[];
  }) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      console.log('Creating session with data:', sessionData);
      
      const { data: session, error: sessionError } = await supabase
        .from('training_sessions')
        .insert([{ 
          title: sessionData.title,
          session_date: sessionData.session_date,
          duration: sessionData.duration,
          session_type: sessionData.session_type,
          notes: sessionData.notes || null,
          user_id: user.id,
          template_id: null
        }])
        .select()
        .single();

      if (sessionError) throw sessionError;
      console.log('Session created successfully:', session);

      // Create activities if provided
      if (sessionData.activities && sessionData.activities.length > 0) {
        const activitiesData = sessionData.activities.map((activity, index) => ({
          session_id: session.id,
          name: activity.name,
          duration: activity.duration,
          description: activity.description || null,
          category: activity.category,
          order_index: index
        }));

        const { error: activitiesError } = await supabase
          .from('session_activities')
          .insert(activitiesData);

        if (activitiesError) {
          console.error('Error creating activities:', activitiesError);
          throw activitiesError;
        }
        console.log('Activities created successfully');
      }

      // Fetch the complete session with activities
      const { data: completeSession, error: fetchError } = await supabase
        .from('training_sessions')
        .select(`
          *,
          activities:session_activities(*)
        `)
        .eq('id', session.id)
        .single();

      if (fetchError) throw fetchError;

      setSessions(prev => [completeSession, ...prev]);
      return { data: completeSession, error: null };
    } catch (error: any) {
      console.error('Error in createSession:', error);
      return { data: null, error: error.message };
    }
  };

  const createSessionFromTemplate = async (templateId: string, sessionData: {
    title: string;
    session_date: string;
    notes?: string;
  }) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      // Get template data from static data
      const template = sessionTemplates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Create session
      const { data: session, error: sessionError } = await supabase
        .from('training_sessions')
        .insert([{
          ...sessionData,
          user_id: user.id,
          duration: template.duration,
          session_type: 'training' as const,
          template_id: null // We don't store template references since they're static
        }])
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create activities from template
      if (template.activities && template.activities.length > 0) {
        const activities = template.activities.map(activity => ({
          session_id: session.id,
          name: activity.name,
          duration: activity.duration,
          description: activity.description,
          category: activity.category,
          order_index: activity.order_index
        }));

        const { error: activitiesError } = await supabase
          .from('session_activities')
          .insert(activities);

        if (activitiesError) throw activitiesError;
      }

      // Fetch the complete session with activities
      const { data: completeSession, error: fetchError } = await supabase
        .from('training_sessions')
        .select(`
          *,
          activities:session_activities(*)
        `)
        .eq('id', session.id)
        .single();

      if (fetchError) throw fetchError;

      setSessions(prev => [completeSession, ...prev]);
      return { data: completeSession, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const updateSession = async (id: string, updates: Partial<TrainingSession>) => {
    try {
      // If activities are included in updates, handle them separately
      const { activities, ...sessionUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from('training_sessions')
        .update(sessionUpdates)
        .eq('id', id)
        .select(`
          *,
          activities:session_activities(*)
        `)
        .single();

      if (error) throw error;
      
      // If activities were provided, update them
      if (activities && Array.isArray(activities)) {
        // Delete existing activities
        await supabase
          .from('session_activities')
          .delete()
          .eq('session_id', id);
        
        // Insert new activities
        if (activities.length > 0) {
          const activitiesData = activities.map((activity: any, index: number) => ({
            session_id: id,
            name: activity.name,
            duration: activity.duration,
            description: activity.description,
            category: activity.category,
            order_index: index
          }));
          
          const { error: activitiesError } = await supabase
            .from('session_activities')
            .insert(activitiesData);
          
          if (activitiesError) throw activitiesError;
        }
        
        // Fetch updated session with activities
        const { data: updatedSession, error: fetchError } = await supabase
          .from('training_sessions')
          .select(`
            *,
            activities:session_activities(*)
          `)
          .eq('id', id)
          .single();
        
        if (fetchError) throw fetchError;
        setSessions(prev => prev.map(s => s.id === id ? updatedSession : s));
        return { data: updatedSession, error: null };
      }
      
      setSessions(prev => prev.map(s => s.id === id ? data : s));
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('training_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSessions(prev => prev.filter(s => s.id !== id));
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  return {
    sessions,
    loading,
    error,
    createSession,
    createSessionFromTemplate,
    updateSession,
    deleteSession,
    refetch: fetchSessions,
  };
}