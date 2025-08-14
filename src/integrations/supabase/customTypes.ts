
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface CountrySchema {
  id: number;
  name: string;
  created_at: string;
}

export interface DepartmentSchema {
  id: number;
  name: string;
  created_at: string;
}

export interface DocumentTypeSchema {
  id: number;
  name: string;
  created_at: string;
}

export interface DocumentNameSchema {
  id: string;
  name: string;
  department: string;
  document_type: string;
  created_at: string;
}

export interface DocumentLogSchema {
  id: string;
  document_id: string;
  user_id: string;
  action: string;
  details: Json | null;
  action_date: string;
}

export interface DocumentRequestSchema {
  id: string;
  title: string;
  status: string;
  is_breached: boolean | null;
  created_at: string;
  document_owners: Json | null;
  reviewers: Json | null;
  document_creators: Json | null;
  compliance_names: Json | null;
  department: string | null;
  country: string | null;
  document_code: string | null;
  document_number: string | null;
  version_number: string | null;
  document_type: string | null;
  upload_date: string | null;
  last_revision_date: string | null;
  next_revision_date: string | null;
  comments: Json | null;
  compliance_contacts: Json | null;
  updated_at: string | null;
}

export interface ChangeRequestSchema {
  id: string;
  document_id: string;
  requestor_id: string;
  requestor_name: string;
  document_name: string;
  description: string | null;
  status: string;
  request_type: string;
  created_at: string;
  updated_at: string;
  comments: Json | null;
  approver_name: string | null;
  approver_email: string | null;
  attachment_name: string | null;
  attachment_url: string | null;
}

export type Database = {
  public: {
    Tables: {
      countries: {
        Row: CountrySchema;
        Insert: Omit<CountrySchema, 'id' | 'created_at'> & { 
          id?: number;
          created_at?: string;
        };
        Update: Partial<Omit<CountrySchema, 'id'>> & { id?: number };
      };
      departments: {
        Row: DepartmentSchema;
        Insert: Omit<DepartmentSchema, 'id' | 'created_at'> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Omit<DepartmentSchema, 'id'>> & { id?: number };
      };
      document_types: {
        Row: DocumentTypeSchema;
        Insert: Omit<DocumentTypeSchema, 'id' | 'created_at'> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Omit<DocumentTypeSchema, 'id'>> & { id?: number };
      };
      document_logs: {
        Row: DocumentLogSchema;
        Insert: Omit<DocumentLogSchema, 'id' | 'action_date'> & {
          id?: string;
          action_date?: string;
        };
        Update: Partial<Omit<DocumentLogSchema, 'id'>> & { id?: string };
      };
      document_names: {
        Row: DocumentNameSchema;
        Insert: Omit<DocumentNameSchema, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DocumentNameSchema, 'id'>> & { id?: string };
      };
      document_requests: {
        Row: DocumentRequestSchema;
        Insert: Omit<DocumentRequestSchema, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DocumentRequestSchema, 'id'>> & { id?: string };
      };
      change_requests: {
        Row: ChangeRequestSchema;
        Insert: Omit<ChangeRequestSchema, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ChangeRequestSchema, 'id'>> & { id?: string };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
