export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          business_id: string | null;
          created_at: string;
          id: string;
          ip_hash: string | null;
          metadata: Json;
          scan_id: string | null;
          target_id: string | null;
          target_type: string | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          business_id?: string | null;
          created_at?: string;
          id?: string;
          ip_hash?: string | null;
          metadata?: Json;
          scan_id?: string | null;
          target_id?: string | null;
          target_type?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          business_id?: string | null;
          created_at?: string;
          id?: string;
          ip_hash?: string | null;
          metadata?: Json;
          scan_id?: string | null;
          target_id?: string | null;
          target_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_logs_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
        ];
      };
      business_locations: {
        Row: {
          address_line1: string | null;
          address_line2: string | null;
          business_id: string;
          city: string;
          country: string;
          created_at: string;
          id: string;
          is_primary: boolean;
          label: string | null;
          phone: string | null;
          place_reference: string | null;
          postal_code: string | null;
          state: string;
          updated_at: string;
        };
        Insert: {
          address_line1?: string | null;
          address_line2?: string | null;
          business_id: string;
          city: string;
          country?: string;
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          label?: string | null;
          phone?: string | null;
          place_reference?: string | null;
          postal_code?: string | null;
          state: string;
          updated_at?: string;
        };
        Update: {
          address_line1?: string | null;
          address_line2?: string | null;
          business_id?: string;
          city?: string;
          country?: string;
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          label?: string | null;
          phone?: string | null;
          place_reference?: string | null;
          postal_code?: string | null;
          state?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "business_locations_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      businesses: {
        Row: {
          aliases: string[];
          category: string;
          city: string;
          created_at: string;
          id: string;
          name: string;
          owner_id: string;
          phone: string | null;
          primary_services: string[];
          state: string;
          updated_at: string;
          website: string | null;
          website_host: string | null;
        };
        Insert: {
          aliases?: string[];
          category: string;
          city: string;
          created_at?: string;
          id?: string;
          name: string;
          owner_id: string;
          phone?: string | null;
          primary_services?: string[];
          state: string;
          updated_at?: string;
          website?: string | null;
          website_host?: string | null;
        };
        Update: {
          aliases?: string[];
          category?: string;
          city?: string;
          created_at?: string;
          id?: string;
          name?: string;
          owner_id?: string;
          phone?: string | null;
          primary_services?: string[];
          state?: string;
          updated_at?: string;
          website?: string | null;
          website_host?: string | null;
        };
        Relationships: [];
      };
      detected_competitors: {
        Row: {
          aliases: string[];
          canonical_name: string;
          created_at: string;
          id: string;
          mention_count: number;
          normalized_key: string;
          recommendation_count: number;
          scan_id: string;
          website_host: string | null;
        };
        Insert: {
          aliases?: string[];
          canonical_name: string;
          created_at?: string;
          id?: string;
          mention_count?: number;
          normalized_key: string;
          recommendation_count?: number;
          scan_id: string;
          website_host?: string | null;
        };
        Update: {
          aliases?: string[];
          canonical_name?: string;
          created_at?: string;
          id?: string;
          mention_count?: number;
          normalized_key?: string;
          recommendation_count?: number;
          scan_id?: string;
          website_host?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "detected_competitors_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          amount_cents: number;
          business_id: string | null;
          created_at: string;
          currency: string;
          id: string;
          owner_id: string;
          product_code: string;
          provider: string | null;
          provider_reference: string | null;
          scan_id: string | null;
          status: Database["public"]["Enums"]["order_status"];
          updated_at: string;
        };
        Insert: {
          amount_cents?: number;
          business_id?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          owner_id: string;
          product_code: string;
          provider?: string | null;
          provider_reference?: string | null;
          scan_id?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          business_id?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          owner_id?: string;
          product_code?: string;
          provider?: string | null;
          provider_reference?: string | null;
          scan_id?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          company_name: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          plan: string;
          updated_at: string;
        };
        Insert: {
          company_name?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          plan?: string;
          updated_at?: string;
        };
        Update: {
          company_name?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          plan?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recommendations: {
        Row: {
          action_window: string | null;
          business_id: string;
          code: string;
          created_at: string;
          detail: string | null;
          dimension: string | null;
          effort: number;
          evidence: Json;
          id: string;
          impact: number;
          priority: number;
          scan_id: string;
          title: string;
        };
        Insert: {
          action_window?: string | null;
          business_id: string;
          code: string;
          created_at?: string;
          detail?: string | null;
          dimension?: string | null;
          effort?: number;
          evidence?: Json;
          id?: string;
          impact?: number;
          priority?: number;
          scan_id: string;
          title: string;
        };
        Update: {
          action_window?: string | null;
          business_id?: string;
          code?: string;
          created_at?: string;
          detail?: string | null;
          dimension?: string | null;
          effort?: number;
          evidence?: Json;
          id?: string;
          impact?: number;
          priority?: number;
          scan_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recommendations_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recommendations_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
        ];
      };
      report_versions: {
        Row: {
          algorithm_version: string;
          business_id: string;
          created_at: string;
          id: string;
          is_sample: boolean;
          payload: Json;
          scan_id: string;
          version: number;
        };
        Insert: {
          algorithm_version: string;
          business_id: string;
          created_at?: string;
          id?: string;
          is_sample?: boolean;
          payload?: Json;
          scan_id: string;
          version?: number;
        };
        Update: {
          algorithm_version?: string;
          business_id?: string;
          created_at?: string;
          id?: string;
          is_sample?: boolean;
          payload?: Json;
          scan_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "report_versions_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "report_versions_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
        ];
      };
      run_mentions: {
        Row: {
          business_id: string | null;
          competitor_id: string | null;
          created_at: string;
          entity_name: string;
          evidence_snippet: string | null;
          first_char_offset: number | null;
          id: string;
          kind: Database["public"]["Enums"]["mention_kind"];
          list_length: number | null;
          list_position: number | null;
          mentioned: boolean;
          recommended: boolean;
          scan_id: string;
          scan_run_id: string;
        };
        Insert: {
          business_id?: string | null;
          competitor_id?: string | null;
          created_at?: string;
          entity_name: string;
          evidence_snippet?: string | null;
          first_char_offset?: number | null;
          id?: string;
          kind: Database["public"]["Enums"]["mention_kind"];
          list_length?: number | null;
          list_position?: number | null;
          mentioned?: boolean;
          recommended?: boolean;
          scan_id: string;
          scan_run_id: string;
        };
        Update: {
          business_id?: string | null;
          competitor_id?: string | null;
          created_at?: string;
          entity_name?: string;
          evidence_snippet?: string | null;
          first_char_offset?: number | null;
          id?: string;
          kind?: Database["public"]["Enums"]["mention_kind"];
          list_length?: number | null;
          list_position?: number | null;
          mentioned?: boolean;
          recommended?: boolean;
          scan_id?: string;
          scan_run_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "run_mentions_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "run_mentions_competitor_id_fkey";
            columns: ["competitor_id"];
            isOneToOne: false;
            referencedRelation: "detected_competitors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "run_mentions_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "run_mentions_scan_run_id_fkey";
            columns: ["scan_run_id"];
            isOneToOne: false;
            referencedRelation: "scan_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      run_sources: {
        Row: {
          created_at: string;
          host: string | null;
          id: string;
          is_owned_domain: boolean;
          position: number | null;
          scan_id: string;
          scan_run_id: string;
          title: string | null;
          url: string;
        };
        Insert: {
          created_at?: string;
          host?: string | null;
          id?: string;
          is_owned_domain?: boolean;
          position?: number | null;
          scan_id: string;
          scan_run_id: string;
          title?: string | null;
          url: string;
        };
        Update: {
          created_at?: string;
          host?: string | null;
          id?: string;
          is_owned_domain?: boolean;
          position?: number | null;
          scan_id?: string;
          scan_run_id?: string;
          title?: string | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "run_sources_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "run_sources_scan_run_id_fkey";
            columns: ["scan_run_id"];
            isOneToOne: false;
            referencedRelation: "scan_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      scan_queries: {
        Row: {
          created_at: string;
          id: string;
          intent_type: string;
          locale: string;
          position: number;
          query_text: string;
          scan_id: string;
          service_focus: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          intent_type: string;
          locale?: string;
          position?: number;
          query_text: string;
          scan_id: string;
          service_focus?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          intent_type?: string;
          locale?: string;
          position?: number;
          query_text?: string;
          scan_id?: string;
          service_focus?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "scan_queries_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
        ];
      };
      scan_runs: {
        Row: {
          answer_text: string | null;
          attempt: number;
          created_at: string;
          error_code: string | null;
          error_message: string | null;
          id: string;
          latency_ms: number | null;
          model: string | null;
          provider: string;
          raw_response: Json | null;
          scan_id: string;
          scan_query_id: string;
          status: Database["public"]["Enums"]["run_status"];
        };
        Insert: {
          answer_text?: string | null;
          attempt?: number;
          created_at?: string;
          error_code?: string | null;
          error_message?: string | null;
          id?: string;
          latency_ms?: number | null;
          model?: string | null;
          provider: string;
          raw_response?: Json | null;
          scan_id: string;
          scan_query_id: string;
          status?: Database["public"]["Enums"]["run_status"];
        };
        Update: {
          answer_text?: string | null;
          attempt?: number;
          created_at?: string;
          error_code?: string | null;
          error_message?: string | null;
          id?: string;
          latency_ms?: number | null;
          model?: string | null;
          provider?: string;
          raw_response?: Json | null;
          scan_id?: string;
          scan_query_id?: string;
          status?: Database["public"]["Enums"]["run_status"];
        };
        Relationships: [
          {
            foreignKeyName: "scan_runs_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scan_runs_scan_query_id_fkey";
            columns: ["scan_query_id"];
            isOneToOne: false;
            referencedRelation: "scan_queries";
            referencedColumns: ["id"];
          },
        ];
      };
      scans: {
        Row: {
          business_id: string;
          completed_at: string | null;
          created_at: string;
          error_code: string | null;
          error_message: string | null;
          id: string;
          idempotency_key: string;
          owner_id: string;
          progress: number;
          providers_failed: string[];
          providers_requested: string[];
          providers_succeeded: string[];
          scan_type: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["scan_status"];
          updated_at: string;
        };
        Insert: {
          business_id: string;
          completed_at?: string | null;
          created_at?: string;
          error_code?: string | null;
          error_message?: string | null;
          id?: string;
          idempotency_key: string;
          owner_id: string;
          progress?: number;
          providers_failed?: string[];
          providers_requested?: string[];
          providers_succeeded?: string[];
          scan_type?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["scan_status"];
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          completed_at?: string | null;
          created_at?: string;
          error_code?: string | null;
          error_message?: string | null;
          id?: string;
          idempotency_key?: string;
          owner_id?: string;
          progress?: number;
          providers_failed?: string[];
          providers_requested?: string[];
          providers_succeeded?: string[];
          scan_type?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["scan_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scans_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      score_snapshots: {
        Row: {
          algorithm_version: string;
          business_id: string;
          coverage: Json;
          created_at: string;
          id: string;
          readiness_components: Json;
          readiness_score: number | null;
          scan_id: string;
          share_of_voice: number | null;
          visibility_components: Json;
          visibility_score: number | null;
        };
        Insert: {
          algorithm_version: string;
          business_id: string;
          coverage?: Json;
          created_at?: string;
          id?: string;
          readiness_components?: Json;
          readiness_score?: number | null;
          scan_id: string;
          share_of_voice?: number | null;
          visibility_components?: Json;
          visibility_score?: number | null;
        };
        Update: {
          algorithm_version?: string;
          business_id?: string;
          coverage?: Json;
          created_at?: string;
          id?: string;
          readiness_components?: Json;
          readiness_score?: number | null;
          scan_id?: string;
          share_of_voice?: number | null;
          visibility_components?: Json;
          visibility_score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "score_snapshots_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "score_snapshots_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
        ];
      };
      site_audits: {
        Row: {
          business_id: string;
          created_at: string;
          error_code: string | null;
          fetch_ms: number | null;
          final_url: string | null;
          findings: Json;
          http_status: number | null;
          id: string;
          raw_meta: Json | null;
          scan_id: string;
          signals: Json;
          url: string;
        };
        Insert: {
          business_id: string;
          created_at?: string;
          error_code?: string | null;
          fetch_ms?: number | null;
          final_url?: string | null;
          findings?: Json;
          http_status?: number | null;
          id?: string;
          raw_meta?: Json | null;
          scan_id: string;
          signals?: Json;
          url: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          error_code?: string | null;
          fetch_ms?: number | null;
          final_url?: string | null;
          findings?: Json;
          http_status?: number | null;
          id?: string;
          raw_meta?: Json | null;
          scan_id?: string;
          signals?: Json;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "site_audits_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_audits_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          cancel_at: string | null;
          created_at: string;
          current_period_end: string | null;
          id: string;
          owner_id: string;
          plan_code: string;
          provider: string | null;
          provider_reference: string | null;
          status: Database["public"]["Enums"]["subscription_status"];
          updated_at: string;
        };
        Insert: {
          cancel_at?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          owner_id: string;
          plan_code: string;
          provider?: string | null;
          provider_reference?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
        };
        Update: {
          cancel_at?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          owner_id?: string;
          plan_code?: string;
          provider?: string | null;
          provider_reference?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      usage_events: {
        Row: {
          cost_micros: number | null;
          created_at: string;
          event_type: string;
          id: string;
          metadata: Json;
          owner_id: string | null;
          provider: string | null;
          quantity: number;
          scan_id: string | null;
        };
        Insert: {
          cost_micros?: number | null;
          created_at?: string;
          event_type: string;
          id?: string;
          metadata?: Json;
          owner_id?: string | null;
          provider?: string | null;
          quantity?: number;
          scan_id?: string | null;
        };
        Update: {
          cost_micros?: number | null;
          created_at?: string;
          event_type?: string;
          id?: string;
          metadata?: Json;
          owner_id?: string | null;
          provider?: string | null;
          quantity?: number;
          scan_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "usage_events_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: "admin" | "user";
      mention_kind: "target" | "competitor";
      order_status: "pending" | "paid" | "failed" | "refunded";
      run_status: "pending" | "running" | "succeeded" | "failed" | "skipped" | "timeout";
      scan_status:
        | "created"
        | "validating"
        | "crawling"
        | "profile_ready"
        | "generating_queries"
        | "running_tests"
        | "normalizing_entities"
        | "calculating_scores"
        | "generating_recommendations"
        | "rendering_report"
        | "complete"
        | "partial"
        | "failed"
        | "refund_review";
      subscription_status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      mention_kind: ["target", "competitor"],
      order_status: ["pending", "paid", "failed", "refunded"],
      run_status: ["pending", "running", "succeeded", "failed", "skipped", "timeout"],
      scan_status: [
        "created",
        "validating",
        "crawling",
        "profile_ready",
        "generating_queries",
        "running_tests",
        "normalizing_entities",
        "calculating_scores",
        "generating_recommendations",
        "rendering_report",
        "complete",
        "partial",
        "failed",
        "refund_review",
      ],
      subscription_status: ["active", "trialing", "past_due", "canceled", "incomplete"],
    },
  },
} as const;
