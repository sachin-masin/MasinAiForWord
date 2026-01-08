export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          active: boolean
          audience: Database["public"]["Enums"]["announcement_audience"]
          body: string
          created_at: string
          created_by: string
          id: string
          organization_id: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          audience?: Database["public"]["Enums"]["announcement_audience"]
          body: string
          created_at?: string
          created_by: string
          id?: string
          organization_id?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          audience?: Database["public"]["Enums"]["announcement_audience"]
          body?: string
          created_at?: string
          created_by?: string
          id?: string
          organization_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_announcements: {
        Row: {
          id: string
          title: string
          message: string
          type: string
          priority: string
          target_audience: string
          status: string
          scheduled_at: string | null
          expires_at: string | null
          created_by: string | null
          created_at: string
          active: boolean | null
        }
        Insert: {
          id?: string
          title: string
          message: string
          type?: string
          priority?: string
          target_audience?: string
          status?: string
          scheduled_at?: string | null
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
          active?: boolean | null
        }
        Update: {
          id?: string
          title?: string
          message?: string
          type?: string
          priority?: string
          target_audience?: string
          status?: string
          scheduled_at?: string | null
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
          active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      global_prompts: {
        Row: {
          id: string
          name: string
          prompt_text: string
          type: string
          category: string[]
          practice_area: string[]
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          prompt_text: string
          type: string
          category?: string[]
          practice_area?: string[]
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          prompt_text?: string
          type?: string
          category?: string[]
          practice_area?: string[]
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "global_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      global_evidence_engine: {
        Row: {
          id: string
          name: string
          description: string | null
          steps: Json
          category: string[]
          practice_area: string[]
          created_by: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          steps?: Json
          category?: string[]
          practice_area?: string[]
          created_by: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          steps?: Json
          category?: string[]
          practice_area?: string[]
          created_by?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "global_evidence_engine_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      login_events: {
        Row: {
          id: string
          user_id: string | null
          ip: string | null
          location: Json | null
          user_agent: string | null
          session_id: string | null
          created_at: string
          status: string | null
          risk_score: number | null
          is_suspicious: boolean | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          ip?: string | null
          location?: Json | null
          user_agent?: string | null
          session_id?: string | null
          created_at?: string
          status?: string | null
          risk_score?: number | null
          is_suspicious?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string | null
          ip?: string | null
          location?: Json | null
          user_agent?: string | null
          session_id?: string | null
          created_at?: string
          status?: string | null
          risk_score?: number | null
          is_suspicious?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "login_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      features: {
        Row: {
          id: string
          key: string
          name: string
          description: string | null
          category: string
          icon: string | null
          is_global_default: boolean | null
          is_active: boolean | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          name: string
          description?: string | null
          category?: string
          icon?: string | null
          is_global_default?: boolean | null
          is_active?: boolean | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          name?: string
          description?: string | null
          category?: string
          icon?: string | null
          is_global_default?: boolean | null
          is_active?: boolean | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_features: {
        Row: {
          organization_id: string
          feature_id: string
          is_enabled: boolean
          settings: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          organization_id: string
          feature_id: string
          is_enabled: boolean
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          organization_id?: string
          feature_id?: string
          is_enabled?: boolean
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_features_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      ip_alerts: {
        Row: {
          id: string
          user_id: string | null
          ip_address: string | null
          alert_type: string | null
          severity: string | null
          message: string | null
          details: Json | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          ip_address?: string | null
          alert_type?: string | null
          severity?: string | null
          message?: string | null
          details?: Json | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          ip_address?: string | null
          alert_type?: string | null
          severity?: string | null
          message?: string | null
          details?: Json | null
          status?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ip_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          user_email: string | null
          organization_id: string | null
          organization_name: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          severity: 'low' | 'medium' | 'high' | 'critical' | null
          status: 'success' | 'failure' | 'warning' | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id?: string | null
          user_email?: string | null
          organization_id?: string | null
          organization_name?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          severity?: 'low' | 'medium' | 'high' | 'critical' | null
          status?: 'success' | 'failure' | 'warning' | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string | null
          user_email?: string | null
          organization_id?: string | null
          organization_name?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          severity?: 'low' | 'medium' | 'high' | 'critical' | null
          status?: 'success' | 'failure' | 'warning' | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          created_at: string
          document_session_id: string | null
          id: string
          knowhub_project_id: string | null
          project_id: string | null
          source: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_session_id?: string | null
          id?: string
          knowhub_project_id?: string | null
          project_id?: string | null
          source?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_session_id?: string | null
          id?: string
          knowhub_project_id?: string | null
          project_id?: string | null
          source?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_path: string
          file_size: number | null
          filename: string
          id: string
          mime_type: string | null
          processed: boolean | null
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          mime_type?: string | null
          processed?: boolean | null
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          mime_type?: string | null
          processed?: boolean | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_role_access: {
        Row: {
          allowed: boolean
          created_at: string
          feature_key: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          allowed?: boolean
          created_at?: string
          feature_key: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          allowed?: boolean
          created_at?: string
          feature_key?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "feature_role_access_feature_key_fkey"
            columns: ["feature_key"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["key"]
          },
        ]
      }

      fine_tuning_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          job_id: string
          model: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          job_id: string
          model: string
          status: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          job_id?: string
          model?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }

      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          sources: Json | null
          follow_up_questions: Json | null
          sequence_number: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          sources?: Json | null
          follow_up_questions?: Json | null
          sequence_number?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          sources?: Json | null
          follow_up_questions?: Json | null
          sequence_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_versions: {
        Row: {
          id: string
          message_id: string
          conversation_id: string
          version_number: number
          content: string
          content_html: string | null
          created_at: string
          created_by: string | null
          is_current: boolean
          metadata: Json | null
        }
        Insert: {
          id?: string
          message_id: string
          conversation_id: string
          version_number: number
          content: string
          content_html?: string | null
          created_at?: string
          created_by?: string | null
          is_current?: boolean
          metadata?: Json | null
        }
        Update: {
          id?: string
          message_id?: string
          conversation_id?: string
          version_number?: number
          content?: string
          content_html?: string | null
          created_at?: string
          created_by?: string | null
          is_current?: boolean
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "message_versions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_versions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_users: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          industry: string | null
          job_title: string | null
          years_experience: number | null
          practice_areas: string[] | null
          preferred_language: string | null
          primary_work_location: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
          industry?: string | null
          job_title?: string | null
          years_experience?: number | null
          practice_areas?: string[] | null
          preferred_language?: string | null
          primary_work_location?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          industry?: string | null
          job_title?: string | null
          years_experience?: number | null
          practice_areas?: string[] | null
          preferred_language?: string | null
          primary_work_location?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          file_count: number | null
          folder_count: number | null
          id: string
          name: string
          query_count: number | null
          storage_path: string | null
          storage_size: number | null
          updated_at: string
          user_id: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_count?: number | null
          folder_count?: number | null
          id?: string
          name: string
          query_count?: number | null
          storage_path?: string | null
          storage_size?: number | null
          updated_at?: string
          user_id: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_count?: number | null
          folder_count?: number | null
          id?: string
          name?: string
          query_count?: number | null
          storage_path?: string | null
          storage_size?: number | null
          updated_at?: string
          user_id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      knowledgebases: {
        Row: {
          id: string
          name: string
          description: string | null
          user_id: string
          organization_id: string
          storage_path: string | null
          file_count: number | null
          folder_count: number | null
          query_count: number | null
          storage_size: number | null
          metadata: Json | null
          access_type: string
          shared_emails: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          user_id: string
          organization_id: string
          storage_path?: string | null
          file_count?: number | null
          folder_count?: number | null
          query_count?: number | null
          storage_size?: number | null
          metadata?: Json | null
          access_type?: string
          shared_emails?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          user_id?: string
          organization_id?: string
          storage_path?: string | null
          file_count?: number | null
          folder_count?: number | null
          query_count?: number | null
          storage_size?: number | null
          metadata?: Json | null
          access_type?: string
          shared_emails?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      repositories: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_global: boolean
          name: string
          type: Database["public"]["Enums"]["repository_type"]
          updated_at: string
          category: string | null
          is_public: boolean | null
          access_level: string | null
          tags: string[] | null
          metadata: Json | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_global?: boolean
          name: string
          type: Database["public"]["Enums"]["repository_type"]
          updated_at?: string
          category?: string | null
          is_public?: boolean | null
          access_level?: string | null
          tags?: string[] | null
          metadata?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_global?: boolean
          name?: string
          type?: Database["public"]["Enums"]["repository_type"]
          updated_at?: string
          category?: string | null
          is_public?: boolean | null
          access_level?: string | null
          tags?: string[] | null
          metadata?: Json | null
        }
        Relationships: []
      }
      repository_documents: {
        Row: {
          created_at: string
          document_id: string
          id: string
          repository_id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          repository_id: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          repository_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repository_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repository_documents_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          id: string
          platform_name: string
          platform_description: string | null
          maintenance_mode: boolean | null
          maintenance_message: string | null
          password_min_length: number | null
          password_require_special: boolean | null
          password_require_numbers: boolean | null
          session_timeout: number | null
          max_login_attempts: number | null
          enable_2fa: boolean | null
          smtp_host: string | null
          smtp_port: number | null
          smtp_username: string | null
          smtp_password: string | null
          smtp_encryption: string | null
          from_email: string | null
          from_name: string | null
          email_notifications: boolean | null
          system_notifications: boolean | null
          maintenance_notifications: boolean | null
          enable_registration: boolean | null
          enable_guest_access: boolean | null
          enable_api_access: boolean | null
          enable_analytics: boolean | null
          max_file_size: number | null
          allowed_file_types: string[] | null
          storage_provider: string | null
          api_rate_limit: number | null
          upload_rate_limit: number | null
          chat_rate_limit: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          platform_name?: string
          platform_description?: string | null
          maintenance_mode?: boolean | null
          maintenance_message?: string | null
          password_min_length?: number | null
          password_require_special?: boolean | null
          password_require_numbers?: boolean | null
          session_timeout?: number | null
          max_login_attempts?: number | null
          enable_2fa?: boolean | null
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          smtp_password?: string | null
          smtp_encryption?: string | null
          from_email?: string | null
          from_name?: string | null
          email_notifications?: boolean | null
          system_notifications?: boolean | null
          maintenance_notifications?: boolean | null
          enable_registration?: boolean | null
          enable_guest_access?: boolean | null
          enable_api_access?: boolean | null
          enable_analytics?: boolean | null
          max_file_size?: number | null
          allowed_file_types?: string[] | null
          storage_provider?: string | null
          api_rate_limit?: number | null
          upload_rate_limit?: number | null
          chat_rate_limit?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          platform_name?: string
          platform_description?: string | null
          maintenance_mode?: boolean | null
          maintenance_message?: string | null
          password_min_length?: number | null
          password_require_special?: boolean | null
          password_require_numbers?: boolean | null
          session_timeout?: number | null
          max_login_attempts?: number | null
          enable_2fa?: boolean | null
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          smtp_password?: string | null
          smtp_encryption?: string | null
          from_email?: string | null
          from_name?: string | null
          email_notifications?: boolean | null
          system_notifications?: boolean | null
          maintenance_notifications?: boolean | null
          enable_registration?: boolean | null
          enable_guest_access?: boolean | null
          enable_api_access?: boolean | null
          enable_analytics?: boolean | null
          max_file_size?: number | null
          allowed_file_types?: string[] | null
          storage_provider?: string | null
          api_rate_limit?: number | null
          upload_rate_limit?: number | null
          chat_rate_limit?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      user_usage_stats: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          month: string
          queries_used: number
          pages_processed: number
          storage_used_gb: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          month: string
          queries_used?: number
          pages_processed?: number
          storage_used_gb?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          month?: string
          queries_used?: number
          pages_processed?: number
          storage_used_gb?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_usage_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_usage_stats_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      organization_limits: {
        Row: {
          id: string
          organization_id: string
          monthly_queries: number
          monthly_pages: number
          storage_gb: number
          max_users: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          monthly_queries?: number
          monthly_pages?: number
          storage_gb?: number
          max_users?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          monthly_queries?: number
          monthly_pages?: number
          storage_gb?: number
          max_users?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_limits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      user_limits: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          monthly_queries: number | null
          monthly_pages: number | null
          storage_gb: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          monthly_queries?: number | null
          monthly_pages?: number | null
          storage_gb?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          monthly_queries?: number | null
          monthly_pages?: number | null
          storage_gb?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_limits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      usage_warnings: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          type: string
          percentage: number
          current_usage: number
          limit_value: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          type: string
          percentage: number
          current_usage: number
          limit_value: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          type?: string
          percentage?: number
          current_usage?: number
          limit_value?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_warnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_warnings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_query_usage: {
        Args: {
          p_user_id: string
          p_organization_id: string
          p_month: string
        }
        Returns: void
      }
      increment_page_usage: {
        Args: {
          p_user_id: string
          p_organization_id: string
          p_month: string
          p_pages: number
        }
        Returns: void
      }
      update_storage_usage: {
        Args: {
          p_user_id: string
          p_organization_id: string
          p_month: string
          p_storage_delta_gb: number
        }
        Returns: void
      }
      get_organization_usage_summary: {
        Args: {
          p_organization_id: string
          p_month?: string
        }
        Returns: {
          total_users: number
          total_queries: number
          total_pages: number
          total_storage_gb: number
          avg_queries_per_user: number
          avg_pages_per_user: number
        }[]
      }
      get_user_query_count: {
        Args: {
          p_user_id: string
          p_organization_id: string
          p_month: string
        }
        Returns: number
      }
      get_user_storage_usage: {
        Args: {
          p_user_id: string
          p_organization_id: string
        }
        Returns: number
      }
    }
    Enums: {
      announcement_audience: "all" | "organization" | "user"
      app_org_role: "owner" | "admin" | "member" | "viewer"
      app_role: "superadmin" | "admin" | "moderator" | "user"
      repository_type: "case_law" | "policy" | "reference"
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
      announcement_audience: ["all", "organization", "user"],
      app_org_role: ["owner", "admin", "member", "viewer"],
      app_role: ["superadmin", "admin", "moderator", "user"],
      repository_type: ["case_law", "policy", "reference", "policy_documents", "reference_materials", "legal_precedents", "regulations"],
    },
  },
} as const
