export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Links: {
        Row: {
          created_at: string | null
          id: number
          title: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          title: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          title?: string
          url?: string
          user_id?: string
        }
      }
      Users: {
        Row: {
          created_at: string | null
          id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          username?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
