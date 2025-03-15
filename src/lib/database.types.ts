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
      subscriptions: {
        Row: {
          id: string
          email: string
          created_at: string | null
          expires_at: string | null
          token: string | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string | null
          expires_at?: string | null
          token?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string | null
          expires_at?: string | null
          token?: string | null
        }
      }
    }
  }
}