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
      activities: {
        Row: {
          activity_date: string
          activity_type: Database["public"]["Enums"]["activity_type"]
          arena_id: string | null
          created_at: string
          ends_at: string | null
          id: string
          import_batch_id: string | null
          is_published: boolean
          note_en: string | null
          note_fr: string | null
          opponent: string | null
          published_at: string | null
          rink: string | null
          starts_at: string
          status: Database["public"]["Enums"]["activity_status"]
          team_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          activity_date: string
          activity_type?: Database["public"]["Enums"]["activity_type"]
          arena_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          import_batch_id?: string | null
          is_published?: boolean
          note_en?: string | null
          note_fr?: string | null
          opponent?: string | null
          published_at?: string | null
          rink?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["activity_status"]
          team_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          activity_date?: string
          activity_type?: Database["public"]["Enums"]["activity_type"]
          arena_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          import_batch_id?: string | null
          is_published?: boolean
          note_en?: string | null
          note_fr?: string | null
          opponent?: string | null
          published_at?: string | null
          rink?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["activity_status"]
          team_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "activities_arena_id_fkey"
            columns: ["arena_id"]
            isOneToOne: false
            referencedRelation: "arenas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      album_teams: {
        Row: {
          album_id: string
          team_id: string
        }
        Insert: {
          album_id: string
          team_id: string
        }
        Update: {
          album_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_teams_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "album_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      albums: {
        Row: {
          cover_url: string | null
          created_at: string
          description_en: string | null
          description_fr: string | null
          event_date: string | null
          event_type: string | null
          id: string
          season_id: string | null
          slug: string
          state: Database["public"]["Enums"]["content_state"]
          title_en: string | null
          title_fr: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          season_id?: string | null
          slug: string
          state?: Database["public"]["Enums"]["content_state"]
          title_en?: string | null
          title_fr: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          season_id?: string | null
          slug?: string
          state?: Database["public"]["Enums"]["content_state"]
          title_en?: string | null
          title_fr?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "albums_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      arenas: {
        Row: {
          address: string | null
          address_verified: boolean
          city: string | null
          created_at: string
          facilities: string[]
          id: string
          is_visible: boolean
          latitude: number | null
          longitude: number | null
          name: string
          official_url: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          address_verified?: boolean
          city?: string | null
          created_at?: string
          facilities?: string[]
          id?: string
          is_visible?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          official_url?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          address_verified?: boolean
          city?: string | null
          created_at?: string
          facilities?: string[]
          id?: string
          is_visible?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          official_url?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name_en: string
          name_fr: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en: string
          name_fr: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string
          name_fr?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      change_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          new_value: Json | null
          previous_value: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          consent_given: boolean
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: Database["public"]["Enums"]["message_status"]
          subject: string
          team_or_category: string | null
          updated_at: string
        }
        Insert: {
          consent_given?: boolean
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: Database["public"]["Enums"]["message_status"]
          subject: string
          team_or_category?: string | null
          updated_at?: string
        }
        Update: {
          consent_given?: boolean
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string
          team_or_category?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string | null
          created_at: string
          description_en: string | null
          description_fr: string | null
          external_url: string | null
          id: string
          is_published: boolean
          is_restricted: boolean
          storage_path: string | null
          title_en: string | null
          title_fr: string
          updated_at: string
          updated_on: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          external_url?: string | null
          id?: string
          is_published?: boolean
          is_restricted?: boolean
          storage_path?: string | null
          title_en?: string | null
          title_fr: string
          updated_at?: string
          updated_on?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          external_url?: string | null
          id?: string
          is_published?: boolean
          is_restricted?: boolean
          storage_path?: string | null
          title_en?: string | null
          title_fr?: string
          updated_at?: string
          updated_on?: string | null
        }
        Relationships: []
      }
      faq: {
        Row: {
          answer_en: string | null
          answer_fr: string | null
          created_at: string
          id: string
          is_published: boolean
          is_validated: boolean
          question_en: string | null
          question_fr: string
          sort_order: number
          source_path: string | null
          topic: string
          updated_at: string
        }
        Insert: {
          answer_en?: string | null
          answer_fr?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          is_validated?: boolean
          question_en?: string | null
          question_fr: string
          sort_order?: number
          source_path?: string | null
          topic: string
          updated_at?: string
        }
        Update: {
          answer_en?: string | null
          answer_fr?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          is_validated?: boolean
          question_en?: string | null
          question_fr?: string
          sort_order?: number
          source_path?: string | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      import_batches: {
        Row: {
          created_at: string
          created_by: string | null
          file_name: string
          id: string
          is_published: boolean
          is_reverted: boolean
          notes: string | null
          rows_accepted: number
          rows_rejected: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_name: string
          id?: string
          is_published?: boolean
          is_reverted?: boolean
          notes?: string | null
          rows_accepted?: number
          rows_rejected?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_name?: string
          id?: string
          is_published?: boolean
          is_reverted?: boolean
          notes?: string | null
          rows_accepted?: number
          rows_rejected?: number
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author: string | null
          body_en: string | null
          body_fr: string | null
          category: string | null
          created_at: string
          excerpt_en: string | null
          excerpt_fr: string | null
          id: string
          image_url: string | null
          published_on: string | null
          season_id: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          state: Database["public"]["Enums"]["content_state"]
          title_en: string | null
          title_fr: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          body_en?: string | null
          body_fr?: string | null
          category?: string | null
          created_at?: string
          excerpt_en?: string | null
          excerpt_fr?: string | null
          id?: string
          image_url?: string | null
          published_on?: string | null
          season_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          state?: Database["public"]["Enums"]["content_state"]
          title_en?: string | null
          title_fr: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          body_en?: string | null
          body_fr?: string | null
          category?: string | null
          created_at?: string
          excerpt_en?: string | null
          excerpt_fr?: string | null
          id?: string
          image_url?: string | null
          published_on?: string | null
          season_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          state?: Database["public"]["Enums"]["content_state"]
          title_en?: string | null
          title_fr?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      news_teams: {
        Row: {
          news_id: string
          team_id: string
        }
        Insert: {
          news_id: string
          team_id: string
        }
        Update: {
          news_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_teams_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          album_id: string
          caption_en: string | null
          caption_fr: string | null
          consent_obtained: boolean
          created_at: string
          id: string
          image_url: string
          is_published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          album_id: string
          caption_en?: string | null
          caption_fr?: string | null
          consent_obtained?: boolean
          created_at?: string
          id?: string
          image_url: string
          is_published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          album_id?: string
          caption_en?: string | null
          caption_fr?: string | null
          consent_obtained?: boolean
          created_at?: string
          id?: string
          image_url?: string
          is_published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          created_at: string
          ends_on: string | null
          id: string
          is_current: boolean
          label: string
          starts_on: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_on?: string | null
          id?: string
          is_current?: boolean
          label: string
          starts_on?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_on?: string | null
          id?: string
          is_current?: boolean
          label?: string
          starts_on?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          logo_authorized: boolean
          logo_url: string | null
          name: string
          sort_order: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          logo_authorized?: boolean
          logo_url?: string | null
          name: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          logo_authorized?: boolean
          logo_url?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          category_id: string | null
          created_at: string
          division: string | null
          id: string
          is_visible: boolean
          name_en: string
          name_fr: string
          season_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          division?: string | null
          id?: string
          is_visible?: boolean
          name_en: string
          name_fr: string
          season_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          division?: string | null
          id?: string
          is_visible?: boolean
          name_en?: string
          name_fr?: string
          season_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
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
      [_ in never]: never
    }
    Functions: {
      can_manage: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_status: "confirmed" | "modified" | "cancelled" | "tentative"
      activity_type:
        | "game"
        | "practice"
        | "tournament"
        | "tryout"
        | "event"
        | "other"
      app_role:
        | "admin"
        | "schedule_manager"
        | "comms_manager"
        | "photo_manager"
        | "volunteer"
      content_state: "draft" | "published" | "archived"
      message_status: "new" | "in_progress" | "answered" | "closed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      activity_status: ["confirmed", "modified", "cancelled", "tentative"],
      activity_type: [
        "game",
        "practice",
        "tournament",
        "tryout",
        "event",
        "other",
      ],
      app_role: [
        "admin",
        "schedule_manager",
        "comms_manager",
        "photo_manager",
        "volunteer",
      ],
      content_state: ["draft", "published", "archived"],
      message_status: ["new", "in_progress", "answered", "closed"],
    },
  },
} as const
