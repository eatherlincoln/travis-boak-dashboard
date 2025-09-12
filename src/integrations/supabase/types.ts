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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      analytics: {
        Row: {
          id: string
          metric: string
          recorded_at: string
          source: string
          updated_at: string
          value: number
        }
        Insert: {
          id?: string
          metric: string
          recorded_at?: string
          source: string
          updated_at?: string
          value: number
        }
        Update: {
          id?: string
          metric?: string
          recorded_at?: string
          source?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      analytics_public: {
        Row: {
          metric: string
          source: string
          updated_at: string
          value: number
        }
        Insert: {
          metric: string
          source: string
          updated_at?: string
          value: number
        }
        Update: {
          metric?: string
          source?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      instagram_posts: {
        Row: {
          comments_count: number | null
          content_type: string | null
          created_at: string | null
          engagement_rate: number | null
          hashtags: string[] | null
          id: string
          image_url: string | null
          impressions_count: number | null
          likes_count: number | null
          post_url: string
          posted_at: string | null
          reach_count: number | null
          saves_count: number | null
          shares_count: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content_type?: string | null
          created_at?: string | null
          engagement_rate?: number | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          impressions_count?: number | null
          likes_count?: number | null
          post_url: string
          posted_at?: string | null
          reach_count?: number | null
          saves_count?: number | null
          shares_count?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content_type?: string | null
          created_at?: string | null
          engagement_rate?: number | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          impressions_count?: number | null
          likes_count?: number | null
          post_url?: string
          posted_at?: string | null
          reach_count?: number | null
          saves_count?: number | null
          shares_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      instagram_posts_public: {
        Row: {
          caption: string | null
          comment_count: number | null
          like_count: number | null
          media_id: string
          media_url: string | null
          permalink: string | null
          reach: number | null
          saves: number | null
          timestamp: string | null
          updated_at: string
        }
        Insert: {
          caption?: string | null
          comment_count?: number | null
          like_count?: number | null
          media_id: string
          media_url?: string | null
          permalink?: string | null
          reach?: number | null
          saves?: number | null
          timestamp?: string | null
          updated_at?: string
        }
        Update: {
          caption?: string | null
          comment_count?: number | null
          like_count?: number | null
          media_id?: string
          media_url?: string | null
          permalink?: string | null
          reach?: number | null
          saves?: number | null
          timestamp?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      platform_audience: {
        Row: {
          age_groups: Json | null
          cities: Json | null
          countries: Json | null
          gender: Json | null
          id: string
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age_groups?: Json | null
          cities?: Json | null
          countries?: Json | null
          gender?: Json | null
          id?: string
          platform: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age_groups?: Json | null
          cities?: Json | null
          countries?: Json | null
          gender?: Json | null
          id?: string
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_stats: {
        Row: {
          additional_metrics: Json | null
          engagement_rate: number | null
          follower_count: number | null
          id: string
          image_urls: Json | null
          monthly_views: number | null
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_metrics?: Json | null
          engagement_rate?: number | null
          follower_count?: number | null
          id?: string
          image_urls?: Json | null
          monthly_views?: number | null
          platform: string
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_metrics?: Json | null
          engagement_rate?: number | null
          follower_count?: number | null
          id?: string
          image_urls?: Json | null
          monthly_views?: number | null
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_change_log: {
        Row: {
          changed_at: string | null
          changed_by: string
          id: string
          new_role: string
          old_role: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by: string
          id?: string
          new_role: string
          old_role?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string
          id?: string
          new_role?: string
          old_role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      social_media_assets: {
        Row: {
          source: string
          thumb_path: string
          updated_at: string
        }
        Insert: {
          source: string
          thumb_path: string
          updated_at?: string
        }
        Update: {
          source?: string
          thumb_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      youtube_stats: {
        Row: {
          channel_id: string
          created_at: string
          id: string
          subscriber_count: number | null
          updated_at: string
          user_id: string
          video_count: number | null
          view_count: number | null
        }
        Insert: {
          channel_id: string
          created_at?: string
          id?: string
          subscriber_count?: number | null
          updated_at?: string
          user_id: string
          video_count?: number | null
          view_count?: number | null
        }
        Update: {
          channel_id?: string
          created_at?: string
          id?: string
          subscriber_count?: number | null
          updated_at?: string
          user_id?: string
          video_count?: number | null
          view_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
