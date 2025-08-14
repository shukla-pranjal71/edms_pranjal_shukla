export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      change_requests: {
        Row: {
          approver_email: string | null
          approver_name: string | null
          attachment_name: string | null
          attachment_url: string | null
          comments: Json | null
          created_at: string
          description: string | null
          document_id: string
          document_name: string
          file_url: string | null
          id: string
          request_type: string
          requestor_id: string
          requestor_name: string
          status: string
          updated_at: string
        }
        Insert: {
          approver_email?: string | null
          approver_name?: string | null
          attachment_name?: string | null
          attachment_url?: string | null
          comments?: Json | null
          created_at?: string
          description?: string | null
          document_id: string
          document_name: string
          file_url?: string | null
          id?: string
          request_type?: string
          requestor_id: string
          requestor_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          approver_email?: string | null
          approver_name?: string | null
          attachment_name?: string | null
          attachment_url?: string | null
          comments?: Json | null
          created_at?: string
          description?: string | null
          document_id?: string
          document_name?: string
          file_url?: string | null
          id?: string
          request_type?: string
          requestor_id?: string
          requestor_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      document_logs: {
        Row: {
          action: string
          action_date: string
          details: Json | null
          document_id: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          action_date?: string
          details?: Json | null
          document_id: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          action_date?: string
          details?: Json | null
          document_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      document_names: {
        Row: {
          created_at: string
          department: string
          document_type: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          department: string
          document_type: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          department?: string
          document_type?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      document_requests: {
        Row: {
          comments: Json | null
          compliance_contacts: Json | null
          compliance_names: Json | null
          country: string | null
          created_at: string
          department: string | null
          document_code: string | null
          document_creators: Json | null
          document_number: string | null
          document_owners: Json | null
          document_type: string | null
          id: string
          is_breached: boolean | null
          last_revision_date: string | null
          next_revision_date: string | null
          reviewers: Json | null
          status: string
          title: string
          updated_at: string | null
          upload_date: string | null
          version_number: string | null
        }
        Insert: {
          comments?: Json | null
          compliance_contacts?: Json | null
          compliance_names?: Json | null
          country?: string | null
          created_at?: string
          department?: string | null
          document_code?: string | null
          document_creators?: Json | null
          document_number?: string | null
          document_owners?: Json | null
          document_type?: string | null
          id?: string
          is_breached?: boolean | null
          last_revision_date?: string | null
          next_revision_date?: string | null
          reviewers?: Json | null
          status?: string
          title: string
          updated_at?: string | null
          upload_date?: string | null
          version_number?: string | null
        }
        Update: {
          comments?: Json | null
          compliance_contacts?: Json | null
          compliance_names?: Json | null
          country?: string | null
          created_at?: string
          department?: string | null
          document_code?: string | null
          document_creators?: Json | null
          document_number?: string | null
          document_owners?: Json | null
          document_type?: string | null
          id?: string
          is_breached?: boolean | null
          last_revision_date?: string | null
          next_revision_date?: string | null
          reviewers?: Json | null
          status?: string
          title?: string
          updated_at?: string | null
          upload_date?: string | null
          version_number?: string | null
        }
        Relationships: []
      }
      document_types: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          country: string
          created_at: string
          department: string
          email: string
          employee_code: number | null
          id: string
          name: string
          role: string
          sla_days: string
        }
        Insert: {
          country: string
          created_at?: string
          department: string
          email: string
          employee_code?: number | null
          id?: string
          name: string
          role: string
          sla_days: string
        }
        Update: {
          country?: string
          created_at?: string
          department?: string
          email?: string
          employee_code?: number | null
          id?: string
          name?: string
          role?: string
          sla_days?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
