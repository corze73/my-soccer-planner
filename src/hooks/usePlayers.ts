import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Player {
  id: string;
  name: string;
  jersey_number: number;
  position_id: string;
  preferred_foot: 'left' | 'right' | 'both';
  skills: string[];
  created_at: string;
  updated_at: string;
  position?: {
    id: string;
    name: string;
    abbreviation: string;
    color: string;
  };
}

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPlayers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          position:positions(*)
        `)
        .eq('user_id', user.id)
        .order('jersey_number');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addPlayer = async (playerData: {
    name: string;
    jersey_number: number;
    position_id: string;
    preferred_foot: 'left' | 'right' | 'both';
    skills: string[];
  }) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('players')
        .insert([{ ...playerData, user_id: user.id }])
        .select(`
          *,
          position:positions(*)
        `)
        .single();

      if (error) throw error;
      setPlayers(prev => [...prev, data]);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const updatePlayer = async (id: string, updates: Partial<Player>) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          position:positions(*)
        `)
        .single();

      if (error) throw error;
      setPlayers(prev => prev.map(p => p.id === id ? data : p));
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const deletePlayer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPlayers(prev => prev.filter(p => p.id !== id));
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [user]);

  return {
    players,
    loading,
    error,
    addPlayer,
    updatePlayer,
    deletePlayer,
    refetch: fetchPlayers,
  };
}