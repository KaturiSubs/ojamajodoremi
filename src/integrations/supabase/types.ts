export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      hotspots: {
        Row: {
          created_at: string
          height_pct: number
          id: string
          secret_id: string
          width_pct: number
          x_pct: number
          y_pct: number
        }
        Insert: {
          created_at?: string
          height_pct?: number
          id?: string
          secret_id: string
          width_pct?: number
          x_pct: number
          y_pct: number
        }
        Update: {
          created_at?: string
          height_pct?: number
          id?: string
          secret_id?: string
          width_pct?: number
          x_pct?: number
          y_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "hotspots_secret_id_fkey"
            columns: ["secret_id"]
            isOneToOne: false
            referencedRelation: "secrets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotspots_secret_id_fkey"
            columns: ["secret_id"]
            isOneToOne: false
            referencedRelation: "secrets_public"
            referencedColumns: ["id"]
          },
        ]
      }
      secret_submissions: {
        Row: {
          created_at: string
          guess: string
          id: string
          is_correct: boolean
          secret_slug: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          guess: string
          id?: string
          is_correct?: boolean
          secret_slug: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          guess?: string
          id?: string
          is_correct?: boolean
          secret_slug?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      secrets: {
        Row: {
          correct_answers: string[]
          created_at: string
          discovery_type: string
          id: string
          key_sequence: string | null
          label: string | null
          on_correct_redirect: string | null
          prompt: string
          slug: string
        }
        Insert: {
          correct_answers?: string[]
          created_at?: string
          discovery_type?: string
          id?: string
          key_sequence?: string | null
          label?: string | null
          on_correct_redirect?: string | null
          prompt?: string
          slug: string
        }
        Update: {
          correct_answers?: string[]
          created_at?: string
          discovery_type?: string
          id?: string
          key_sequence?: string | null
          label?: string | null
          on_correct_redirect?: string | null
          prompt?: string
          slug?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          background_kind: string
          background_url: string | null
          countdown_target_at: string | null
          default_volume: number
          id: number
          music_url: string | null
          title: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          background_kind?: string
          background_url?: string | null
          countdown_target_at?: string | null
          default_volume?: number
          id?: number
          music_url?: string | null
          title?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          background_kind?: string
          background_url?: string | null
          countdown_target_at?: string | null
          default_volume?: number
          id?: number
          music_url?: string | null
          title?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      secrets_public: {
        Row: {
          discovery_type: string | null
          id: string | null
          key_sequence: string | null
          label: string | null
          prompt: string | null
          slug: string | null
        }
        Insert: {
          discovery_type?: string | null
          id?: string | null
          key_sequence?: string | null
          label?: string | null
          prompt?: string | null
          slug?: string | null
        }
        Update: {
          discovery_type?: string | null
          id?: string | null
          key_sequence?: string | null
          label?: string | null
          prompt?: string | null
          slug?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
