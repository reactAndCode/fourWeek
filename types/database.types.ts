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
      my_weeklog: {
        Row: {
          id: string
          user_id: string
          work_date: string
          total_minutes: number
          status: 'draft' | 'completed' | 'empty'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          work_date: string
          total_minutes?: number
          status?: 'draft' | 'completed' | 'empty'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          work_date?: string
          total_minutes?: number
          status?: 'draft' | 'completed' | 'empty'
          created_at?: string
          updated_at?: string
        }
      }
      my_weeklog_task: {
        Row: {
          id: string
          weeklog_id: string
          description: string
          minutes: number
          category: 'design' | 'planning' | 'development' | 'analysis'
          tags: string[]
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          weeklog_id: string
          description: string
          minutes?: number
          category: 'design' | 'planning' | 'development' | 'analysis'
          tags?: string[]
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          weeklog_id?: string
          description?: string
          minutes?: number
          category?: 'design' | 'planning' | 'development' | 'analysis'
          tags?: string[]
          sort_order?: number
          created_at?: string
        }
      }
      my_memo: {
        Row: {
          id: string
          user_id: string
          tab_name: string
          title: string
          content: string
          tags: string[]
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tab_name?: string
          title?: string
          content?: string
          tags?: string[]
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tab_name?: string
          title?: string
          content?: string
          tags?: string[]
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      visit_reviews: {
        Row: {
          id: string
          user_id: string
          place_name: string
          address: string | null
          lat: number | null
          lng: number | null
          rating: number
          content: string | null
          visited_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          place_name: string
          address?: string | null
          lat?: number | null
          lng?: number | null
          rating?: number
          content?: string | null
          visited_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          place_name?: string
          address?: string | null
          lat?: number | null
          lng?: number | null
          rating?: number
          content?: string | null
          visited_date?: string
          created_at?: string
          updated_at?: string
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
