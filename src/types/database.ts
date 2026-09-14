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
      affiliate_clicks: {
        Row: {
          clicked_at: string
          clicked_by_user_id: string | null
          converted: boolean | null
          creator_id: string
          enrollment_id: string
          id: string
          order_id: string | null
          product_id: string
          session_id: string
          utm_params: Json | null
        }
        Insert: {
          clicked_at?: string
          clicked_by_user_id?: string | null
          converted?: boolean | null
          creator_id: string
          enrollment_id: string
          id?: string
          order_id?: string | null
          product_id: string
          session_id: string
          utm_params?: Json | null
        }
        Update: {
          clicked_at?: string
          clicked_by_user_id?: string | null
          converted?: boolean | null
          creator_id?: string
          enrollment_id?: string
          id?: string
          order_id?: string | null
          product_id?: string
          session_id?: string
          utm_params?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_clicked_by_user_id_fkey"
            columns: ["clicked_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_clicks_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_clicks_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "affiliate_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_clicks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_clicks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_commissions: {
        Row: {
          approved_at: string | null
          commission_amount_mru: number
          commission_rate: number
          created_at: string
          creator_id: string
          enrollment_id: string
          id: string
          merchant_id: string
          order_completed_at: string | null
          order_id: string
          payout_id: string | null
          status: string | null
        }
        Insert: {
          approved_at?: string | null
          commission_amount_mru: number
          commission_rate: number
          created_at?: string
          creator_id: string
          enrollment_id: string
          id?: string
          merchant_id: string
          order_completed_at?: string | null
          order_id: string
          payout_id?: string | null
          status?: string | null
        }
        Update: {
          approved_at?: string | null
          commission_amount_mru?: number
          commission_rate?: number
          created_at?: string
          creator_id?: string
          enrollment_id?: string
          id?: string
          merchant_id?: string
          order_completed_at?: string | null
          order_id?: string
          payout_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "affiliate_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_enrollments: {
        Row: {
          approved_at: string | null
          commission_rate: number
          created_at: string
          creator_id: string
          id: string
          product_id: string | null
          program_id: string
          rejected_at: string | null
          rejected_reason: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          commission_rate?: number
          created_at?: string
          creator_id: string
          id?: string
          product_id?: string | null
          program_id: string
          rejected_at?: string | null
          rejected_reason?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          commission_rate?: number
          created_at?: string
          creator_id?: string
          id?: string
          product_id?: string | null
          program_id?: string
          rejected_at?: string | null
          rejected_reason?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_enrollments_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_enrollments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "affiliate_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_programs: {
        Row: {
          created_at: string
          default_commission_rate: number
          description: string | null
          enabled: boolean | null
          id: string
          merchant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_commission_rate?: number
          description?: string | null
          enabled?: boolean | null
          id?: string
          merchant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_commission_rate?: number
          description?: string | null
          enabled?: boolean | null
          id?: string
          merchant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_programs_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: true
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      cart: {
        Row: {
          created_at: string
          id: string
          items: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          last_message_at: string | null
          last_message_by_role: string | null
          merchant_id: string
          order_id: string | null
          product_id: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          last_message_at?: string | null
          last_message_by_role?: string | null
          merchant_id: string
          order_id?: string | null
          product_id?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          last_message_at?: string | null
          last_message_by_role?: string | null
          merchant_id?: string
          order_id?: string | null
          product_id?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          cod_enabled: boolean | null
          code: string
          created_at: string
          currency: string
          enabled: boolean | null
          id: string
          language_primary: string
          name: string
          timezone: string | null
        }
        Insert: {
          cod_enabled?: boolean | null
          code: string
          created_at?: string
          currency: string
          enabled?: boolean | null
          id?: string
          language_primary: string
          name: string
          timezone?: string | null
        }
        Update: {
          cod_enabled?: boolean | null
          code?: string
          created_at?: string
          currency?: string
          enabled?: boolean | null
          id?: string
          language_primary?: string
          name?: string
          timezone?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          merchant_id: string | null
          metadata: Json | null
          product_id: string | null
          session_id: string
          user_id: string | null
          video_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          merchant_id?: string | null
          metadata?: Json | null
          product_id?: string | null
          session_id: string
          user_id?: string | null
          video_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          merchant_id?: string | null
          metadata?: Json | null
          product_id?: string | null
          session_id?: string
          user_id?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          enabled: boolean | null
          id: string
          key: string
          notes: string | null
          rollout_percentage: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          id?: string
          key: string
          notes?: string | null
          rollout_percentage?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          id?: string
          key?: string
          notes?: string | null
          rollout_percentage?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          id: string
          merchant_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          id?: string
          merchant_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          id?: string
          merchant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          low_stock_threshold: number | null
          product_id: string
          quantity_available: number | null
          quantity_reserved: number
          quantity_total: number
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          low_stock_threshold?: number | null
          product_id: string
          quantity_available?: number | null
          quantity_reserved?: number
          quantity_total?: number
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          low_stock_threshold?: number | null
          product_id?: string
          quantity_available?: number | null
          quantity_reserved?: number
          quantity_total?: number
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_settings: {
        Row: {
          allows_auctions: boolean | null
          allows_offers: boolean | null
          cod_enabled: boolean | null
          commission_rate: number
          created_at: string
          id: string
          merchant_id: string
          return_policy_days: number | null
          shipping_policy: string | null
          updated_at: string
        }
        Insert: {
          allows_auctions?: boolean | null
          allows_offers?: boolean | null
          cod_enabled?: boolean | null
          commission_rate?: number
          created_at?: string
          id?: string
          merchant_id: string
          return_policy_days?: number | null
          shipping_policy?: string | null
          updated_at?: string
        }
        Update: {
          allows_auctions?: boolean | null
          allows_offers?: boolean | null
          cod_enabled?: boolean | null
          commission_rate?: number
          created_at?: string
          id?: string
          merchant_id?: string
          return_policy_days?: number | null
          shipping_policy?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_settings_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: true
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_verification_documents: {
        Row: {
          created_at: string
          document_type: string
          document_url: string
          id: string
          merchant_id: string
          rejection_reason: string | null
          status: string | null
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          document_url: string
          id?: string
          merchant_id: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          document_url?: string
          id?: string
          merchant_id?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_verification_documents_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          banner_url: string | null
          category: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          rating: number | null
          rating_count: number | null
          response_time: number | null
          return_rate: number | null
          store_name: string
          total_gmv: number | null
          total_sales: number | null
          updated_at: string
          user_id: string
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          banner_url?: string | null
          category: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          rating?: number | null
          rating_count?: number | null
          response_time?: number | null
          return_rate?: number | null
          store_name: string
          total_gmv?: number | null
          total_sales?: number | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          banner_url?: string | null
          category?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          rating?: number | null
          rating_count?: number | null
          response_time?: number | null
          return_rate?: number | null
          store_name?: string
          total_gmv?: number | null
          total_sales?: number | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          id: string
          media_url: string | null
          order_id: string | null
          product_id: string | null
          read: boolean | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          media_url?: string | null
          order_id?: string | null
          product_id?: string | null
          read?: boolean | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          media_url?: string | null
          order_id?: string | null
          product_id?: string | null
          read?: boolean | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          reason: string | null
          report_id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          reason?: string | null
          report_id: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_per_unit_mru: number
          product_id: string
          quantity: number
          total_mru: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_per_unit_mru: number
          product_id: string
          quantity: number
          total_mru: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_per_unit_mru?: number
          product_id?: string
          quantity?: number
          total_mru?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancelled_at: string | null
          commission_mru: number
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          customer_id: string
          delivered_at: string | null
          delivery_address: string
          delivery_city: string | null
          delivery_phone: string | null
          estimated_delivery_date: string | null
          id: string
          merchant_id: string
          order_number: string
          shipped_at: string | null
          status: string
          subtotal_mru: number
          total_mru: number
          tracking_note: string | null
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          commission_mru: number
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_id: string
          delivered_at?: string | null
          delivery_address: string
          delivery_city?: string | null
          delivery_phone?: string | null
          estimated_delivery_date?: string | null
          id?: string
          merchant_id: string
          order_number: string
          shipped_at?: string | null
          status?: string
          subtotal_mru: number
          total_mru: number
          tracking_note?: string | null
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          commission_mru?: number
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_id?: string
          delivered_at?: string | null
          delivery_address?: string
          delivery_city?: string | null
          delivery_phone?: string | null
          estimated_delivery_date?: string | null
          id?: string
          merchant_id?: string
          order_number?: string
          shipped_at?: string | null
          status?: string
          subtotal_mru?: number
          total_mru?: number
          tracking_note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_mru: number
          cod_collected: boolean | null
          cod_confirmed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          method: string
          moosyl_reference: string | null
          moosyl_response: Json | null
          order_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_mru: number
          cod_collected?: boolean | null
          cod_confirmed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          method: string
          moosyl_reference?: string | null
          moosyl_response?: Json | null
          order_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_mru?: number
          cod_collected?: boolean | null
          cod_confirmed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          method?: string
          moosyl_reference?: string | null
          moosyl_response?: Json | null
          order_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount_mru: number
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          payout_destination: Json | null
          payout_method: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_mru: number
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payout_destination?: Json | null
          payout_method?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_mru?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payout_destination?: Json | null
          payout_method?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_hero: boolean | null
          product_id: string
          type: string
          url: string
          video_external_id: string | null
          video_provider: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_hero?: boolean | null
          product_id: string
          type: string
          url: string
          video_external_id?: string | null
          video_provider?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_hero?: boolean | null
          product_id?: string
          type?: string
          url?: string
          video_external_id?: string | null
          video_provider?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          name: string
          price_adjustment_mru: number | null
          product_id: string
          sku: string | null
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price_adjustment_mru?: number | null
          product_id: string
          sku?: string | null
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price_adjustment_mru?: number | null
          product_id?: string
          sku?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          click_count: number | null
          commission_rate_override: number | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          like_count: number | null
          merchant_id: string
          name: string
          price_mru: number
          purchase_count: number | null
          rating: number | null
          rating_count: number | null
          refund_count: number | null
          refund_rate: number | null
          sku: string | null
          subcategory: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category: string
          click_count?: number | null
          commission_rate_override?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          like_count?: number | null
          merchant_id: string
          name: string
          price_mru: number
          purchase_count?: number | null
          rating?: number | null
          rating_count?: number | null
          refund_count?: number | null
          refund_rate?: number | null
          sku?: string | null
          subcategory?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category?: string
          click_count?: number | null
          commission_rate_override?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          like_count?: number | null
          merchant_id?: string
          name?: string
          price_mru?: number
          purchase_count?: number | null
          rating?: number | null
          rating_count?: number | null
          refund_count?: number | null
          refund_rate?: number | null
          sku?: string | null
          subcategory?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount_mru: number
          auto_approved_at: string | null
          completed_at: string | null
          created_at: string
          id: string
          merchant_approved: boolean | null
          merchant_response: string | null
          merchant_response_at: string | null
          notes: string | null
          order_id: string
          order_status_before: string | null
          reason: string
          refund_method: string | null
          requested_by_id: string
          requested_by_role: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_mru: number
          auto_approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          merchant_approved?: boolean | null
          merchant_response?: string | null
          merchant_response_at?: string | null
          notes?: string | null
          order_id: string
          order_status_before?: string | null
          reason: string
          refund_method?: string | null
          requested_by_id: string
          requested_by_role: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_mru?: number
          auto_approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          merchant_approved?: boolean | null
          merchant_response?: string | null
          merchant_response_at?: string | null
          notes?: string | null
          order_id?: string
          order_status_before?: string | null
          reason?: string
          refund_method?: string | null
          requested_by_id?: string
          requested_by_role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_requested_by_id_fkey"
            columns: ["requested_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      review_media: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          review_id: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          review_id: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          review_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_media_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          customer_id: string
          deleted_at: string | null
          helpful_count: number | null
          id: string
          merchant_id: string
          order_id: string
          product_id: string
          rating_merchant: number
          rating_product: number
          status: string | null
          text: string | null
          title: string | null
          updated_at: string
          verified_purchase: boolean | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          deleted_at?: string | null
          helpful_count?: number | null
          id?: string
          merchant_id: string
          order_id: string
          product_id: string
          rating_merchant: number
          rating_product: number
          status?: string | null
          text?: string | null
          title?: string | null
          updated_at?: string
          verified_purchase?: boolean | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          deleted_at?: string | null
          helpful_count?: number | null
          id?: string
          merchant_id?: string
          order_id?: string
          product_id?: string
          rating_merchant?: number
          rating_product?: number
          status?: string | null
          text?: string | null
          title?: string | null
          updated_at?: string
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      saves: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saves_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          currency: string | null
          email_notifications_enabled: boolean | null
          id: string
          language: string | null
          push_notifications_enabled: boolean | null
          sms_notifications_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          email_notifications_enabled?: boolean | null
          id?: string
          language?: string | null
          push_notifications_enabled?: boolean | null
          sms_notifications_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          email_notifications_enabled?: boolean | null
          id?: string
          language?: string | null
          push_notifications_enabled?: boolean | null
          sms_notifications_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_suspensions: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          reason: string
          suspended_at: string
          suspended_until: string | null
          suspension_type: string
          unsuspended_at: string | null
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          reason: string
          suspended_at?: string
          suspended_until?: string | null
          suspension_type: string
          unsuspended_at?: string | null
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          reason?: string
          suspended_at?: string
          suspended_until?: string | null
          suspension_type?: string
          unsuspended_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_suspensions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_suspensions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string | null
          email_verified: boolean | null
          id: string
          phone_number: string | null
          phone_verified: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          id: string
          phone_number?: string | null
          phone_verified?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          id?: string
          phone_number?: string | null
          phone_verified?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_resolve_report: {
        Args: {
          p_report_id: string
          p_action: string
          p_reason: string | null
          p_suspend_days: number | null
        }
        Returns: undefined
      }
      auto_approve_refunds: { Args: never; Returns: undefined }
      confirm_delivery: { Args: { p_order_id: string }; Returns: undefined }
      create_orders_from_cart: {
        Args: {
          p_delivery_address: string
          p_delivery_city: string
          p_delivery_phone: string
        }
        Returns: {
          order_id: string
          order_number: string
        }[]
      }
      generate_order_number: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_moderator_or_admin: { Args: never; Returns: boolean }
      is_suspended: { Args: never; Returns: boolean }
      merchant_update_order_status: {
        Args: {
          p_order_id: string
          p_new_status: string
          p_tracking_note: string | null
        }
        Returns: undefined
      }
      my_merchant_id: { Args: never; Returns: string }
      request_refund: {
        Args: { p_order_id: string; p_reason: string }
        Returns: string
      }
      respond_to_refund: {
        Args: { p_refund_id: string; p_approve: boolean; p_response: string }
        Returns: undefined
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
    Enums: {},
  },
} as const
