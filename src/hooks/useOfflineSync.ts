import { useEffect } from 'react';
import { useOfflineStorage } from './useOfflineStorage';
import { supabase } from '../lib/supabase';

export function useOfflineSync() {
  const { isOnline, addToSyncQueue } = useOfflineStorage();

  // Wrapper for Supabase operations that handles offline scenarios
  const offlineSupabaseWrapper = {
    from: (table: string) => ({
      insert: async (data: any) => {
        if (isOnline) {
          try {
            return await supabase.from(table).insert(data);
          } catch (error) {
            // If online but request fails, queue for later
            await addToSyncQueue(
              `${supabase.supabaseUrl}/rest/v1/${table}`,
              'POST',
              {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabase.supabaseKey}`,
                'apikey': supabase.supabaseKey
              },
              data
            );
            throw error;
          }
        } else {
          // Queue for sync when online
          await addToSyncQueue(
            `${supabase.supabaseUrl}/rest/v1/${table}`,
            'POST',
            {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabase.supabaseKey}`,
              'apikey': supabase.supabaseKey
            },
            data
          );
          
          // Return a mock response for offline
          return {
            data: { ...data, id: `offline_${Date.now()}` },
            error: null
          };
        }
      },

      update: async (data: any) => ({
        eq: async (column: string, value: any) => {
          if (isOnline) {
            try {
              return await supabase.from(table).update(data).eq(column, value);
            } catch (error) {
              await addToSyncQueue(
                `${supabase.supabaseUrl}/rest/v1/${table}?${column}=eq.${value}`,
                'PATCH',
                {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabase.supabaseKey}`,
                  'apikey': supabase.supabaseKey
                },
                data
              );
              throw error;
            }
          } else {
            await addToSyncQueue(
              `${supabase.supabaseUrl}/rest/v1/${table}?${column}=eq.${value}`,
              'PATCH',
              {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabase.supabaseKey}`,
                'apikey': supabase.supabaseKey
              },
              data
            );
            
            return {
              data: { ...data, [column]: value },
              error: null
            };
          }
        }
      }),

      delete: async () => ({
        eq: async (column: string, value: any) => {
          if (isOnline) {
            try {
              return await supabase.from(table).delete().eq(column, value);
            } catch (error) {
              await addToSyncQueue(
                `${supabase.supabaseUrl}/rest/v1/${table}?${column}=eq.${value}`,
                'DELETE',
                {
                  'Authorization': `Bearer ${supabase.supabaseKey}`,
                  'apikey': supabase.supabaseKey
                },
                {}
              );
              throw error;
            }
          } else {
            await addToSyncQueue(
              `${supabase.supabaseUrl}/rest/v1/${table}?${column}=eq.${value}`,
              'DELETE',
              {
                'Authorization': `Bearer ${supabase.supabaseKey}`,
                'apikey': supabase.supabaseKey
              },
              {}
            );
            
            return {
              data: null,
              error: null
            };
          }
        }
      }),

      select: async (columns = '*') => {
        if (isOnline) {
          return await supabase.from(table).select(columns);
        } else {
          // Return cached data or empty result for offline
          return {
            data: [],
            error: { message: 'Offline - using cached data', offline: true }
          };
        }
      }
    })
  };

  return {
    supabase: offlineSupabaseWrapper,
    isOnline
  };
}