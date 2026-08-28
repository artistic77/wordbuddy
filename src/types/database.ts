export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adj'
  | 'adv'
  | 'gerund'
  | 'past_participle'
  | 'other';

export type UserRole = 'user' | 'admin';

export type GameMode =
  | 'flashcard'
  | 'spelling'
  | 'multiple_choice'
  | 'matching'
  | 'fill_blank';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          role: UserRole;
          is_suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          avatar_url?: string | null;
          role?: UserRole;
          is_suspended?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          role?: UserRole;
          is_suspended?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      vocab_sets: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'vocab_sets_owner_id_fkey';
            columns: ['owner_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      vocab_entries: {
        Row: {
          id: string;
          set_id: string;
          owner_id: string;
          word_en: string;
          word_th: string;
          part_of_speech: PartOfSpeech;
          example_sentence_en: string | null;
          example_sentence_th: string | null;
          image_url: string | null;
          audio_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          set_id: string;
          owner_id: string;
          word_en: string;
          word_th: string;
          part_of_speech?: PartOfSpeech;
          example_sentence_en?: string | null;
          example_sentence_th?: string | null;
          image_url?: string | null;
          audio_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          set_id?: string;
          owner_id?: string;
          word_en?: string;
          word_th?: string;
          part_of_speech?: PartOfSpeech;
          example_sentence_en?: string | null;
          example_sentence_th?: string | null;
          image_url?: string | null;
          audio_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'vocab_entries_set_id_fkey';
            columns: ['set_id'];
            referencedRelation: 'vocab_sets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'vocab_entries_owner_id_fkey';
            columns: ['owner_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          set_id: string;
          game_mode: GameMode;
          score: number;
          total: number;
          duration_seconds: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          set_id: string;
          game_mode: GameMode;
          score: number;
          total: number;
          duration_seconds?: number;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          set_id?: string;
          game_mode?: GameMode;
          score?: number;
          total?: number;
          duration_seconds?: number;
          completed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'study_sessions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'study_sessions_set_id_fkey';
            columns: ['set_id'];
            referencedRelation: 'vocab_sets';
            referencedColumns: ['id'];
          }
        ];
      };
      favorite_vocab_sets: {
        Row: {
          id: string;
          user_id: string;
          set_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          set_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          set_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'favorite_vocab_sets_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorite_vocab_sets_set_id_fkey';
            columns: ['set_id'];
            referencedRelation: 'vocab_sets';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type VocabSet = Database['public']['Tables']['vocab_sets']['Row'];
export type VocabEntry = Database['public']['Tables']['vocab_entries']['Row'];
export type StudySession = Database['public']['Tables']['study_sessions']['Row'];
export type FavoriteVocabSet = Database['public']['Tables']['favorite_vocab_sets']['Row'];
