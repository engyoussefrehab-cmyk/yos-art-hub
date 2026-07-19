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
      article_revisions: {
        Row: {
          article_id: string
          created_at: string
          editor_id: string | null
          id: string
          snapshot: Json
        }
        Insert: {
          article_id: string
          created_at?: string
          editor_id?: string | null
          id?: string
          snapshot: Json
        }
        Update: {
          article_id?: string
          created_at?: string
          editor_id?: string | null
          id?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "article_revisions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "insight_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "insight_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_user_id: string | null
          created_at: string
          id: string
          ip: string | null
          meta: Json
          target: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_user_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          meta?: Json
          target?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_user_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          meta?: Json
          target?: string | null
        }
        Relationships: []
      }
      auth_attempts: {
        Row: {
          created_at: string
          email: string
          id: string
          ip: string | null
          reason: string | null
          success: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip?: string | null
          reason?: string | null
          success?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip?: string | null
          reason?: string | null
          success?: boolean
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          ip: unknown
          message: string
          name: string
          phone: string | null
          status: string
          subject: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip?: unknown
          message: string
          name: string
          phone?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip?: unknown
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      insight_articles: {
        Row: {
          author_avatar_url: string | null
          author_name: string
          category_id: string
          content_ar: string
          content_en: string
          cover_url: string | null
          created_at: string
          excerpt_ar: string
          excerpt_en: string
          faq: Json
          featured: boolean
          featured_image_url: string | null
          gallery: Json
          id: string
          keywords: string[]
          published_at: string | null
          reading_minutes: number
          related_article_ids: string[]
          related_slugs: string[]
          scheduled_at: string | null
          seo_description_ar: string
          seo_description_en: string
          seo_title_ar: string
          seo_title_en: string
          slug: string
          status: Database["public"]["Enums"]["article_status"]
          tags: string[]
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          author_avatar_url?: string | null
          author_name?: string
          category_id: string
          content_ar?: string
          content_en?: string
          cover_url?: string | null
          created_at?: string
          excerpt_ar?: string
          excerpt_en?: string
          faq?: Json
          featured?: boolean
          featured_image_url?: string | null
          gallery?: Json
          id?: string
          keywords?: string[]
          published_at?: string | null
          reading_minutes?: number
          related_article_ids?: string[]
          related_slugs?: string[]
          scheduled_at?: string | null
          seo_description_ar?: string
          seo_description_en?: string
          seo_title_ar?: string
          seo_title_en?: string
          slug: string
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[]
          title_ar: string
          title_en?: string
          updated_at?: string
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string
          category_id?: string
          content_ar?: string
          content_en?: string
          cover_url?: string | null
          created_at?: string
          excerpt_ar?: string
          excerpt_en?: string
          faq?: Json
          featured?: boolean
          featured_image_url?: string | null
          gallery?: Json
          id?: string
          keywords?: string[]
          published_at?: string | null
          reading_minutes?: number
          related_article_ids?: string[]
          related_slugs?: string[]
          scheduled_at?: string | null
          seo_description_ar?: string
          seo_description_en?: string
          seo_title_ar?: string
          seo_title_en?: string
          slug?: string
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[]
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insight_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "insight_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      insight_categories: {
        Row: {
          created_at: string
          description_ar: string
          description_en: string
          id: string
          label_ar: string
          label_en: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_ar?: string
          description_en?: string
          id?: string
          label_ar: string
          label_en: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_ar?: string
          description_en?: string
          id?: string
          label_ar?: string
          label_en?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_ar: string | null
          alt_en: string | null
          bucket: string
          created_at: string
          folder_id: string | null
          height: number | null
          id: string
          mime: string | null
          path: string
          size: number | null
          updated_at: string
          uploader_id: string | null
          width: number | null
        }
        Insert: {
          alt_ar?: string | null
          alt_en?: string | null
          bucket: string
          created_at?: string
          folder_id?: string | null
          height?: number | null
          id?: string
          mime?: string | null
          path: string
          size?: number | null
          updated_at?: string
          uploader_id?: string | null
          width?: number | null
        }
        Update: {
          alt_ar?: string | null
          alt_en?: string | null
          bucket?: string
          created_at?: string
          folder_id?: string | null
          height?: number | null
          id?: string
          mime?: string | null
          path?: string
          size?: number | null
          updated_at?: string
          uploader_id?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      media_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      page_seo: {
        Row: {
          canonical_url: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          is_active: boolean
          json_ld: Json | null
          keywords: string | null
          og_image_url: string | null
          robots: string
          route_key: string
          title_ar: string | null
          title_en: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          json_ld?: Json | null
          keywords?: string | null
          og_image_url?: string | null
          robots?: string
          route_key: string
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          json_ld?: Json | null
          keywords?: string | null
          og_image_url?: string | null
          robots?: string
          route_key?: string
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          blocks: Json
          canonical_url: string | null
          created_at: string
          hero: Json
          id: string
          og_image_url: string | null
          published_at: string | null
          robots: string | null
          seo_description_ar: string | null
          seo_description_en: string | null
          seo_keywords: string[] | null
          seo_title_ar: string | null
          seo_title_en: string | null
          slug: string
          status: string
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          blocks?: Json
          canonical_url?: string | null
          created_at?: string
          hero?: Json
          id?: string
          og_image_url?: string | null
          published_at?: string | null
          robots?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords?: string[] | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug: string
          status?: string
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          blocks?: Json
          canonical_url?: string | null
          created_at?: string
          hero?: Json
          id?: string
          og_image_url?: string | null
          published_at?: string | null
          robots?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords?: string[] | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug?: string
          status?: string
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          behance_url: string | null
          brand_colors: Json
          category_id: string | null
          category_slug: string | null
          challenge_ar: string | null
          challenge_en: string | null
          client: string | null
          client_country: string | null
          completed_at: string | null
          cover_media_id: string | null
          created_at: string
          deliverables: Json
          duration: string | null
          embeds: Json
          featured: boolean
          figma_url: string | null
          gallery: Json
          hero_image_url: string | null
          id: string
          industry: string | null
          is_archived: boolean
          is_confidential: boolean
          is_pinned: boolean
          layout_blocks: Json
          name_ar: string
          name_en: string
          og_image_url: string | null
          pdf_url: string | null
          project_url: string | null
          published_at: string | null
          results_ar: string | null
          results_en: string | null
          role: string | null
          scheduled_at: string | null
          seo_description_ar: string | null
          seo_description_en: string | null
          seo_keywords: string[] | null
          seo_title_ar: string | null
          seo_title_en: string | null
          services_used: string[]
          short_description_ar: string | null
          short_description_en: string | null
          slug: string
          solution_ar: string | null
          solution_en: string | null
          sort_order: number
          stats: Json
          status: string
          tags_list: string[]
          team: string | null
          testimonial: Json | null
          thumbnail_url: string | null
          typography: Json
          updated_at: string
          videos: Json
          views_count: number
          year: number | null
        }
        Insert: {
          behance_url?: string | null
          brand_colors?: Json
          category_id?: string | null
          category_slug?: string | null
          challenge_ar?: string | null
          challenge_en?: string | null
          client?: string | null
          client_country?: string | null
          completed_at?: string | null
          cover_media_id?: string | null
          created_at?: string
          deliverables?: Json
          duration?: string | null
          embeds?: Json
          featured?: boolean
          figma_url?: string | null
          gallery?: Json
          hero_image_url?: string | null
          id?: string
          industry?: string | null
          is_archived?: boolean
          is_confidential?: boolean
          is_pinned?: boolean
          layout_blocks?: Json
          name_ar: string
          name_en: string
          og_image_url?: string | null
          pdf_url?: string | null
          project_url?: string | null
          published_at?: string | null
          results_ar?: string | null
          results_en?: string | null
          role?: string | null
          scheduled_at?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords?: string[] | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          services_used?: string[]
          short_description_ar?: string | null
          short_description_en?: string | null
          slug: string
          solution_ar?: string | null
          solution_en?: string | null
          sort_order?: number
          stats?: Json
          status?: string
          tags_list?: string[]
          team?: string | null
          testimonial?: Json | null
          thumbnail_url?: string | null
          typography?: Json
          updated_at?: string
          videos?: Json
          views_count?: number
          year?: number | null
        }
        Update: {
          behance_url?: string | null
          brand_colors?: Json
          category_id?: string | null
          category_slug?: string | null
          challenge_ar?: string | null
          challenge_en?: string | null
          client?: string | null
          client_country?: string | null
          completed_at?: string | null
          cover_media_id?: string | null
          created_at?: string
          deliverables?: Json
          duration?: string | null
          embeds?: Json
          featured?: boolean
          figma_url?: string | null
          gallery?: Json
          hero_image_url?: string | null
          id?: string
          industry?: string | null
          is_archived?: boolean
          is_confidential?: boolean
          is_pinned?: boolean
          layout_blocks?: Json
          name_ar?: string
          name_en?: string
          og_image_url?: string | null
          pdf_url?: string | null
          project_url?: string | null
          published_at?: string | null
          results_ar?: string | null
          results_en?: string | null
          role?: string | null
          scheduled_at?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords?: string[] | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          services_used?: string[]
          short_description_ar?: string | null
          short_description_en?: string | null
          slug?: string
          solution_ar?: string | null
          solution_en?: string | null
          sort_order?: number
          stats?: Json
          status?: string
          tags_list?: string[]
          team?: string | null
          testimonial?: Json | null
          thumbnail_url?: string | null
          typography?: Json
          updated_at?: string
          videos?: Json
          views_count?: number
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "project_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_categories: {
        Row: {
          content_ar: string | null
          content_en: string | null
          cover_image_url: string | null
          created_at: string
          cta_href: string | null
          cta_label_ar: string | null
          cta_label_en: string | null
          description_ar: string | null
          description_en: string | null
          faq: Json
          featured_project_ids: string[]
          hero_image_url: string | null
          icon: string | null
          id: string
          intro_ar: string | null
          intro_en: string | null
          is_hidden: boolean
          name_ar: string
          name_en: string
          og_image_url: string | null
          seo_description_ar: string | null
          seo_description_en: string | null
          seo_keywords: string[] | null
          seo_title_ar: string | null
          seo_title_en: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          content_ar?: string | null
          content_en?: string | null
          cover_image_url?: string | null
          created_at?: string
          cta_href?: string | null
          cta_label_ar?: string | null
          cta_label_en?: string | null
          description_ar?: string | null
          description_en?: string | null
          faq?: Json
          featured_project_ids?: string[]
          hero_image_url?: string | null
          icon?: string | null
          id?: string
          intro_ar?: string | null
          intro_en?: string | null
          is_hidden?: boolean
          name_ar: string
          name_en: string
          og_image_url?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords?: string[] | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          content_ar?: string | null
          content_en?: string | null
          cover_image_url?: string | null
          created_at?: string
          cta_href?: string | null
          cta_label_ar?: string | null
          cta_label_en?: string | null
          description_ar?: string | null
          description_en?: string | null
          faq?: Json
          featured_project_ids?: string[]
          hero_image_url?: string | null
          icon?: string | null
          id?: string
          intro_ar?: string | null
          intro_en?: string | null
          is_hidden?: boolean
          name_ar?: string
          name_en?: string
          og_image_url?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords?: string[] | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      project_tags: {
        Row: {
          project_id: string
          tag_id: string
        }
        Insert: {
          project_id: string
          tag_id: string
        }
        Update: {
          project_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tags_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portfolio_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          cover_media_id: string | null
          created_at: string
          cta_href: string | null
          cta_label_ar: string | null
          cta_label_en: string | null
          description_ar: string | null
          description_en: string | null
          featured: boolean
          features: Json
          icon: string | null
          id: string
          og_image_url: string | null
          published_at: string | null
          seo_description_ar: string | null
          seo_description_en: string | null
          seo_keywords: string[] | null
          seo_title_ar: string | null
          seo_title_en: string | null
          slug: string
          sort_order: number
          status: string
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          cover_media_id?: string | null
          created_at?: string
          cta_href?: string | null
          cta_label_ar?: string | null
          cta_label_en?: string | null
          description_ar?: string | null
          description_en?: string | null
          featured?: boolean
          features?: Json
          icon?: string | null
          id?: string
          og_image_url?: string | null
          published_at?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords?: string[] | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug: string
          sort_order?: number
          status?: string
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          cover_media_id?: string | null
          created_at?: string
          cta_href?: string | null
          cta_label_ar?: string | null
          cta_label_en?: string | null
          description_ar?: string | null
          description_en?: string | null
          featured?: boolean
          features?: Json
          icon?: string | null
          id?: string
          og_image_url?: string | null
          published_at?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords?: string[] | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug?: string
          sort_order?: number
          status?: string
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      site_menus: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_external: boolean
          is_visible: boolean
          label_ar: string
          label_en: string
          location: string
          open_in_new_tab: boolean
          order_index: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_external?: boolean
          is_visible?: boolean
          label_ar: string
          label_en: string
          location: string
          open_in_new_tab?: boolean
          order_index?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_external?: boolean
          is_visible?: boolean
          label_ar?: string
          label_en?: string
          location?: string
          open_in_new_tab?: boolean
          order_index?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      site_sections: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_visible: boolean
          layout_variant: string
          order_index: number
          page_key: string
          section_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          layout_variant?: string
          order_index?: number
          page_key: string
          section_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          layout_variant?: string
          order_index?: number
          page_key?: string
          section_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string | null
          analytics: Json
          company_name: string | null
          contact_email: string | null
          contact_phone: string | null
          copy: Json
          default_lang: string
          favicon_url: string | null
          key: string
          logo_url: string | null
          logo_url_dark: string | null
          og_default_image_url: string | null
          socials: Json
          theme: Json
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          analytics?: Json
          company_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          copy?: Json
          default_lang?: string
          favicon_url?: string | null
          key: string
          logo_url?: string | null
          logo_url_dark?: string | null
          og_default_image_url?: string | null
          socials?: Json
          theme?: Json
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          analytics?: Json
          company_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          copy?: Json
          default_lang?: string
          favicon_url?: string | null
          key?: string
          logo_url?: string | null
          logo_url_dark?: string | null
          og_default_image_url?: string | null
          socials?: Json
          theme?: Json
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          label_ar: string
          label_en: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label_ar: string
          label_en: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label_ar?: string
          label_en?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_featured: boolean
          is_verified: boolean
          is_visible: boolean
          name_ar: string
          name_en: string | null
          order_index: number
          project_date: string | null
          rating: number
          role_ar: string | null
          role_en: string | null
          source: string | null
          source_url: string | null
          text_ar: string
          text_en: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          is_verified?: boolean
          is_visible?: boolean
          name_ar: string
          name_en?: string | null
          order_index?: number
          project_date?: string | null
          rating?: number
          role_ar?: string | null
          role_en?: string | null
          source?: string | null
          source_url?: string | null
          text_ar: string
          text_en?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          is_verified?: boolean
          is_visible?: boolean
          name_ar?: string
          name_en?: string | null
          order_index?: number
          project_date?: string | null
          rating?: number
          role_ar?: string | null
          role_en?: string | null
          source?: string | null
          source_url?: string | null
          text_ar?: string
          text_en?: string | null
          updated_at?: string
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
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "editor"
      article_status: "draft" | "scheduled" | "published"
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
      app_role: ["admin", "editor"],
      article_status: ["draft", "scheduled", "published"],
    },
  },
} as const
