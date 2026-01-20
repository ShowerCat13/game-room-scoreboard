// ============================================================================
// DATABASE TYPES
// Generated from supabase/schema.sql - Beta Schema
// ============================================================================

// Enums
export type ScoreDirection = 'lower_better' | 'higher_better'

export type ScoreFormat =
  | 'integer'       // 47 (points, throws, eliminations)
  | 'time_ms'       // stored as ms, displayed as 1:23.456
  | 'time_seconds'  // stored as seconds, displayed as 1:23
  | 'decimal_2'     // stored as value * 100, displayed as 98.45
  | 'golf_relative' // stored as integer relative to par (-4, 0, +3), displayed as -4, E, +3
  | 'level'         // stored as encoded digits (84), displayed as World 8-4

export type GameCategory =
  | 'racing'
  | 'golf'
  | 'party'
  | 'darts'
  | 'pinball'
  | 'platformer'
  | 'rpg'
  | 'other'

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface Player {
  id: string
  name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  name: string
  category: GameCategory
  platform: string | null
  icon_url: string | null
  
  // Hierarchy configuration
  mode_label: string        // "Mode", "Class", "Machine", "Category"
  detail_label: string      // "Track", "Course", "Fish", "Enemy"
  has_modes: boolean        // If false, skip mode selection
  has_details: boolean      // If false, skip detail selection
  
  // Default score settings (used when mode/detail don't override)
  default_score_format: ScoreFormat
  default_score_direction: ScoreDirection
  default_score_unit: string | null
  
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GameMode {
  id: string
  game_id: string
  name: string
  
  // Override game defaults (null = use game default)
  score_format: ScoreFormat | null
  score_direction: ScoreDirection | null
  score_unit: string | null
  
  // Override detail label for this mode
  detail_label_override: string | null
  
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GameDetail {
  id: string
  game_id: string
  mode_id: string | null  // null = available for all modes, UUID = mode-specific
  name: string
  
  // Override mode/game defaults (null = inherit)
  score_format: ScoreFormat | null
  score_direction: ScoreDirection | null
  score_unit: string | null
  
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HighScore {
  id: string
  player_id: string
  game_id: string
  mode_id: string | null
  detail_id: string | null
  score: number
  metadata: Record<string, unknown>
  achieved_at: string
  created_at: string
}

// ============================================================================
// FUNCTION RETURN TYPES
// ============================================================================

// Return type from get_score_settings function
export interface ScoreSettings {
  score_format: ScoreFormat
  score_direction: ScoreDirection
  score_unit: string | null
}

// Return type from get_leaderboard function
export interface LeaderboardEntry {
  rank: number
  score_id: string
  score: number
  achieved_at: string
  player_id: string
  player_name: string
  player_avatar: string | null
  effective_format: ScoreFormat
  effective_direction: ScoreDirection
  effective_unit: string | null
}

// ============================================================================
// COMPOSITE TYPES (for UI convenience)
// ============================================================================

// Game with related data for display
export interface GameWithModes extends Game {
  modes?: GameMode[]
}

// Mode with related data for display
export interface ModeWithDetails extends GameMode {
  details?: GameDetail[]
  game?: Game
}

// Full context for score entry/display
export interface ScoreContext {
  game: Game
  mode: GameMode | null
  detail: GameDetail | null
  effectiveFormat: ScoreFormat
  effectiveDirection: ScoreDirection
  effectiveUnit: string | null
}

// ============================================================================
// DATABASE SCHEMA TYPE (for Supabase client)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      players: {
        Row: Player
        Insert: {
          id?: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      games: {
        Row: Game
        Insert: {
          id?: string
          name: string
          category: GameCategory
          platform?: string | null
          icon_url?: string | null
          mode_label?: string
          detail_label?: string
          has_modes?: boolean
          has_details?: boolean
          default_score_format?: ScoreFormat
          default_score_direction?: ScoreDirection
          default_score_unit?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: GameCategory
          platform?: string | null
          icon_url?: string | null
          mode_label?: string
          detail_label?: string
          has_modes?: boolean
          has_details?: boolean
          default_score_format?: ScoreFormat
          default_score_direction?: ScoreDirection
          default_score_unit?: string | null
          sort_order?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      game_modes: {
        Row: GameMode
        Insert: {
          id?: string
          game_id: string
          name: string
          score_format?: ScoreFormat | null
          score_direction?: ScoreDirection | null
          score_unit?: string | null
          detail_label_override?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          name?: string
          score_format?: ScoreFormat | null
          score_direction?: ScoreDirection | null
          score_unit?: string | null
          detail_label_override?: string | null
          sort_order?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      game_details: {
        Row: GameDetail
        Insert: {
          id?: string
          game_id: string
          mode_id?: string | null
          name: string
          score_format?: ScoreFormat | null
          score_direction?: ScoreDirection | null
          score_unit?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          mode_id?: string | null
          name?: string
          score_format?: ScoreFormat | null
          score_direction?: ScoreDirection | null
          score_unit?: string | null
          sort_order?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      high_scores: {
        Row: HighScore
        Insert: {
          id?: string
          player_id: string
          game_id: string
          mode_id?: string | null
          detail_id?: string | null
          score: number
          metadata?: Record<string, unknown>
          achieved_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          game_id?: string
          mode_id?: string | null
          detail_id?: string | null
          score?: number
          metadata?: Record<string, unknown>
          achieved_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_score_settings: {
        Args: {
          p_game_id: string
          p_mode_id?: string | null
          p_detail_id?: string | null
        }
        Returns: ScoreSettings[]
      }
      get_leaderboard: {
        Args: {
          p_game_id: string
          p_mode_id?: string | null
          p_detail_id?: string | null
          p_limit?: number
        }
        Returns: LeaderboardEntry[]
      }
      get_detail_label: {
        Args: {
          p_game_id: string
          p_mode_id?: string | null
        }
        Returns: string
      }
    }
    Enums: {
      score_direction: ScoreDirection
      score_format: ScoreFormat
      game_category: GameCategory
    }
  }
}

// ============================================================================
// CONVENIENCE TYPE EXPORTS
// ============================================================================

export type PlayerInsert = Database['public']['Tables']['players']['Insert']
export type PlayerUpdate = Database['public']['Tables']['players']['Update']

export type GameInsert = Database['public']['Tables']['games']['Insert']
export type GameUpdate = Database['public']['Tables']['games']['Update']

export type GameModeInsert = Database['public']['Tables']['game_modes']['Insert']
export type GameModeUpdate = Database['public']['Tables']['game_modes']['Update']

export type GameDetailInsert = Database['public']['Tables']['game_details']['Insert']
export type GameDetailUpdate = Database['public']['Tables']['game_details']['Update']

export type HighScoreInsert = Database['public']['Tables']['high_scores']['Insert']
export type HighScoreUpdate = Database['public']['Tables']['high_scores']['Update']