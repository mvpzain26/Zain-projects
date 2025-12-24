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
      // Add your table types here
      // Example:
      // profiles: {
      //   Row: {
      //     id: string
      //     updated_at?: string
      //     username: string
      //     full_name: string
      //     avatar_url?: string
      //   }
      //   Insert: {
      //     id: string
      //     updated_at?: string
      //     username: string
      //     full_name: string
      //     avatar_url?: string
      //   }
      //   Update: {
      //     id?: string
      //     updated_at?: string
      //     username?: string
      //     full_name?: string
      //     avatar_url?: string
      //   }
      // }
    }
    Views: {
      // Add your view types here
    }
    Functions: {
      // Add your function types here
    }
    Enums: {
      // Add your enum types here
    }
  }
}
