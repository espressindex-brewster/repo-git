// Generato con: supabase gen types typescript --project-id wbgwjwbqmnwgiiijajvf
// Non modificare a mano — rigenera con lo stesso comando dopo ogni migrazione

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      bars: {
        Row: {
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
          disponibilita: Database['public']['Enums']['disponibilita']
          durata_sec: number | null
          id: string
          note: string | null
        }
        Insert: {
          bar_id: string
          chiamata_at?: string
          disponibilita: Database['public']['Enums']['disponibilita']
          durata_sec?: number | null
          id?: string
          note?: string | null
        }
        Update: {
          bar_id?: string
          chiamata_at?: string
          disponibilita?: Database['public']['Enums']['disponibilita']
          durata_sec?: number | null
          id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'calls_bar_id_fkey'
            columns: ['bar_id']
            isOneToOne: false
            referencedRelation: 'bar_sopra_media'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'calls_bar_id_fkey'
            columns: ['bar_id']
            isOneToOne: false
            referencedRelation: 'bars'
            referencedColumns: ['id']
          },
        ]
      }
      prices: {
        Row: {
          bar_id: string
          call_id: string
          cappuccino_bancone: number | null
          created_at: string
          espresso_bancone: number | null
          id: string
          outlier: boolean
        }
        Insert: {
          bar_id: string
          call_id: string
          cappuccino_bancone?: number | null
          created_at?: string
          espresso_bancone?: number | null
          id?: string
          outlier?: boolean
        }
        Update: {
          bar_id?: string
          call_id?: string
          cappuccino_bancone?: number | null
          created_at?: string
          espresso_bancone?: number | null
          id?: string
          outlier?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'prices_bar_id_fkey'
            columns: ['bar_id']
            isOneToOne: false
            referencedRelation: 'bar_sopra_media'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'prices_bar_id_fkey'
            columns: ['bar_id']
            isOneToOne: false
            referencedRelation: 'bars'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'prices_call_id_fkey'
            columns: ['call_id']
            isOneToOne: false
            referencedRelation: 'calls'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      bar_sopra_media: {
        Row: {
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
          ultimo_cappuccino: number | null
          ultimo_espresso: number | null
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
        | 'completa'
        | 'parziale'
        | 'rifiuto'
        | 'non_risponde'
        | 'richiamare'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ── Alias di convenienza ──────────────────────────────────
export type Disponibilita = Database['public']['Enums']['disponibilita']
export type Bar          = Database['public']['Tables']['bars']['Row']
export type Call         = Database['public']['Tables']['calls']['Row']
export type Price        = Database['public']['Tables']['prices']['Row']
export type StatZona     = Database['public']['Views']['stats_zona']['Row']
export type BarConPrezzo = Database['public']['Views']['bar_sopra_media']['Row']
