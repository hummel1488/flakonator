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
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_admin"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          sales_point_id: string
          volume: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity: number
          sales_point_id: string
          volume?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          sales_point_id?: string
          volume?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sales_point"
            columns: ["sales_point_id"]
            isOneToOne: false
            referencedRelation: "sales_points"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          description: string | null
          gender: string | null
          id: string
          name: string
        }
        Insert: {
          brand?: string | null
          description?: string | null
          gender?: string | null
          id?: string
          name: string
        }
        Update: {
          brand?: string | null
          description?: string | null
          gender?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string | null
          id: string
          price: number
          product_id: string
          quantity: number
          sales_point_id: string
          sold_by: string | null
          volume: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price: number
          product_id: string
          quantity: number
          sales_point_id: string
          sold_by?: string | null
          volume?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price?: number
          product_id?: string
          quantity?: number
          sales_point_id?: string
          sold_by?: string | null
          volume?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sales_point"
            columns: ["sales_point_id"]
            isOneToOne: false
            referencedRelation: "sales_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sold_by"
            columns: ["sold_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_points: {
        Row: {
          address: string | null
          contact_person: string | null
          contact_phone: string | null
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          id: string
          name: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          location_id: string | null
          name: string
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          location_id?: string | null
          name: string
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          location_id?: string | null
          name?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_location"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "sales_points"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
