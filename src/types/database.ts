export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
          updated_at?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      product_media: {
        Row: {
          cloudflare_video_id: string | null
          created_at: string
          display_order: number
          id: string
          is_hero: boolean | null
          product_id: string
          type: string
          url: string
        }
        Insert: {
          cloudflare_video_id?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_hero?: boolean | null
          product_id: string
          type: string
          url: string
        }
        Update: {
          cloudflare_video_id?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_hero?: boolean | null
          product_id?: string
          type?: string
          url?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
          reason?: string
          refund_method?: string | null
          requested_by_id?: string
          requested_by_role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
      auto_approve_refunds: { Args: never; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_moderator_or_admin: { Args: never; Returns: boolean }
      my_merchant_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]
