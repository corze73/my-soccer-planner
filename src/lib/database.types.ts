export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          team_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          team_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          team_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      positions: {
        Row: {
          id: string
          name: string
          abbreviation: string
          color: string
        }
        Insert: {
          id: string
          name: string
          abbreviation: string
          color?: string
        }
        Update: {
          id?: string
          name?: string
          abbreviation?: string
          color?: string
        }
      }
      players: {
        Row: {
          id: string
          user_id: string
          name: string
          jersey_number: number
          position_id: string
          preferred_foot: 'left' | 'right' | 'both'
          skills: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          jersey_number: number
          position_id: string
          preferred_foot?: 'left' | 'right' | 'both'
          skills?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          jersey_number?: number
          position_id?: string
          preferred_foot?: 'left' | 'right' | 'both'
          skills?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      formations: {
        Row: {
          id: string
          user_id: string | null
          name: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      formation_positions: {
        Row: {
          id: string
          formation_id: string
          position_id: string
          x_position: number
          y_position: number
          player_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          formation_id: string
          position_id: string
          x_position: number
          y_position: number
          player_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          formation_id?: string
          position_id?: string
          x_position?: number
          y_position?: number
          player_id?: string | null
          created_at?: string
        }
      }
      session_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          duration: number
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          duration?: number
          category?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          duration?: number
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      template_activities: {
        Row: {
          id: string
          template_id: string
          name: string
          duration: number
          description: string | null
          category: 'warmup' | 'technical' | 'tactical' | 'physical' | 'cooldown'
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          name: string
          duration: number
          description?: string | null
          category: 'warmup' | 'technical' | 'tactical' | 'physical' | 'cooldown'
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          name?: string
          duration?: number
          description?: string | null
          category?: 'warmup' | 'technical' | 'tactical' | 'physical' | 'cooldown'
          order_index?: number
          created_at?: string
        }
      }
      training_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          session_date: string
          duration: number
          session_type: 'training' | 'match'
          notes: string | null
          template_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          session_date: string
          duration?: number
          session_type?: 'training' | 'match'
          notes?: string | null
          template_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          session_date?: string
          duration?: number
          session_type?: 'training' | 'match'
          notes?: string | null
          template_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      session_activities: {
        Row: {
          id: string
          session_id: string
          name: string
          duration: number
          description: string | null
          category: 'warmup' | 'technical' | 'tactical' | 'physical' | 'cooldown'
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          name: string
          duration: number
          description?: string | null
          category: 'warmup' | 'technical' | 'tactical' | 'physical' | 'cooldown'
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          name?: string
          duration?: number
          description?: string | null
          category?: 'warmup' | 'technical' | 'tactical' | 'physical' | 'cooldown'
          order_index?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}