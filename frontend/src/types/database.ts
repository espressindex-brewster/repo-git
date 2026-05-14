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
      bars: {
        Row: {
          cap: string | null
          citta: string
          created_at: string
          google_place_id: string | null
          id: string
          lat: number
          lng: number
          nome: string
          regione: string
          telefono: string | null
        }
        Insert: {
          cap?: string | null
          citta: string
          created_at?: string
          google_place_id?: string | null
          id?: string
          lat: number
          lng: number
          nome: string
          regione: string
          telefono?: string | null
        }
        Update: {
          cap?: string | null
          citta?: string
          created_at?: string
          google_place_id?: string | null
          id?: string
          lat?: number
          lng?: number
          nome?: string
          regione?: string
          telefono?: string | null
        }
        Relationships: []
      }
      calls: {
        Row: {
          bar_id: string
          chiamata_at: string
          disponibilita: Database["public"]["Enums"]["disponibilita"]
          durata_sec: number | null
          id: string
          note: string | null
        }
        Insert: {
          bar_id: string
          chiamata_at?: string
          disponibilita: Database["public"]["Enums"]["disponibilita"]
          durata_sec?: number | null
          id?: string
          note?: string | null
        }
        Update: {
          bar_id?: string
          chiamata_at?: string
          disponibilita?: Database["public"]["Enums"]["disponibilita"]
          durata_sec?: number | null
          id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "bar_sopra_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "bars"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          bar_id: string
          call_id: string | null
          cappuccino_bancone: number | null
          created_at: string
          espresso_bancone: number | null
          id: string
          outlier: boolean
        }
        Insert: {
          bar_id: string
          call_id?: string | null
          cappuccino_bancone?: number | null
          created_at?: string
          espresso_bancone?: number | null
          id?: string
          outlier?: boolean
        }
        Update: {
          bar_id?: string
          call_id?: string | null
          cappuccino_bancone?: number | null
          created_at?: string
          espresso_bancone?: number | null
          id?: string
          outlier?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "prices_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "bar_sopra_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prices_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "bars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prices_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          bar_id: string | null
          bar_nome: string
          cappuccino: number | null
          created_at: string
          espresso: number | null
          fonte: string
          id: string
          ip: string | null
          stato: string
        }
        Insert: {
          bar_id?: string | null
          bar_nome: string
          cappuccino?: number | null
          created_at?: string
          espresso?: number | null
          fonte?: string
          id?: string
          ip?: string | null
          stato?: string
        }
        Update: {
          bar_id?: string | null
          bar_nome?: string
          cappuccino?: number | null
          created_at?: string
          espresso?: number | null
          fonte?: string
          id?: string
          ip?: string | null
          stato?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "bar_sopra_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "bars"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      bar_sopra_media: {
        Row: {
          cap: string | null
          citta: string | null
          created_at: string | null
          google_place_id: string | null
          id: string | null
          lat: number | null
          lng: number | null
          nome: string | null
          regione: string | null
          sopra_media: boolean | null
          telefono: string | null
          ultimo_aggiornamento: string | null
          ultimo_cappuccino: number | null
          ultimo_espresso: number | null
        }
        Relationships: []
      }
      stats_cap: {
        Row: {
          aggiornata_at: string | null
          cap: string | null
          citta: string | null
          media_cappuccino: number | null
          media_espresso: number | null
          mediana_cappuccino: number | null
          mediana_espresso: number | null
          n_bar: number | null
          regione: string | null
        }
        Relationships: []
      }
      stats_zona: {
        Row: {
          aggiornata_at: string | null
          citta: string | null
          media_cappuccino: number | null
          media_espresso: number | null
          mediana_cappuccino: number | null
          mediana_espresso: number | null
          n_bar: number | null
          regione: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      disponibilita:
        | "completa"
        | "parziale"
        | "rifiuto"
        | "non_risponde"
        | "richiamare"
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
      disponibilita: [
        "completa",
        "parziale",
        "rifiuto",
        "non_risponde",
        "richiamare",
      ],
    },
  },
} as const
