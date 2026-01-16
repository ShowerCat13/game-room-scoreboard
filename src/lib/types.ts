// ============================================================================
// DATABASE TYPES
// Generated from supabase/schema.sql
// ============================================================================

// Enums
export type ScoreDirection = 'lower_better' | 'higher_better'

export type ScoreFormat =
  | 'integer'       // 47 (points, throws, strokes, eliminations)
  | 'time_ms'       // stored as ms, displayed as 1:23.456 or 2:22.567
  | 'time_seconds'  // stored as seconds, displayed as 1:23 or 4:56
  | 'decimal_2'     // 98.45 (for percentages, etc.)
  | 'level'         // World 8-4 (stored as integer 84, formatted in UI)

export type GameCategory =
  | 'racing'
  | 'golf'
  | 'party'
  | 'darts'
  | 'pinball'
  | 'platformer'
  | 'rpg'
  | 'other'

// Table Types
export interface Player {
  id: string
  name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface TeamMember {
  team_id: string
  player_id: string
  joined_at: string
}

export interface Game {
  id: string
  name: string
  platform: string | null
  category: GameCategory
  icon_url: string | null
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GameMode {
  id: string
  game_id: string
  name: string
  subtitle: string | null
  score_direction: ScoreDirection
  score_format: ScoreFormat
  score_unit: string | null
  context: Record<string, unknown>
  icon_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HighScore {
  id: string
  game_mode_id: string
  player_id: string | null
  team_id: string | null
  score: number
  metadata: Record<string, unknown>
  achieved_at: string
  created_at: string
}

// View Types
export interface LeaderboardEntry {
  score_id: string
  score: number
  achieved_at: string
  score_metadata: Record<string, unknown>

  // Game mode details
  game_mode_id: string
  mode_name: string
  mode_subtitle: string | null
  score_direction: ScoreDirection
  score_format: ScoreFormat
  score_unit: string | null
  mode_context: Record<string, unknown>

  // Game details
  game_id: string
  game_name: string
  platform: string | null
  category: GameCategory
  game_icon: string | null

  // Player details (null if team score)
  player_id: string | null
  player_name: string | null
  player_avatar: string | null

  // Team details (null if player score)
  team_id: string | null
  team_name: string | null
  team_avatar: string | null
}

export interface PersonalBest {
  score_id: string
  score: number
  achieved_at: string
  game_mode_id: string
  player_id: string
  score_direction: ScoreDirection
  score_format: ScoreFormat
  score_unit: string | null
  mode_name: string
  game_name: string
  player_name: string
  player_avatar: string | null
}

// Function Return Types
export interface LeaderboardRank {
  rank: number
  score_id: string
  score: number
  achieved_at: string
  player_id: string | null
  player_name: string | null
  player_avatar: string | null
  team_id: string | null
  team_name: string | null
}

// Database schema type for Supabase client
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
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: Team
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
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: TeamMember
        Insert: {
          team_id: string
          player_id: string
          joined_at?: string
        }
        Update: {
          team_id?: string
          player_id?: string
          joined_at?: string
        }
        Relationships: []
      }
      games: {
        Row: Game
        Insert: {
          id?: string
          name: string
          platform?: string | null
          category: GameCategory
          icon_url?: string | null
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          platform?: string | null
          category?: GameCategory
          icon_url?: string | null
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
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
          subtitle?: string | null
          score_direction: ScoreDirection
          score_format: ScoreFormat
          score_unit?: string | null
          context?: Record<string, unknown>
          icon_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          name?: string
          subtitle?: string | null
          score_direction?: ScoreDirection
          score_format?: ScoreFormat
          score_unit?: string | null
          context?: Record<string, unknown>
          icon_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      high_scores: {
        Row: HighScore
        Insert: {
          id?: string
          game_mode_id: string
          player_id?: string | null
          team_id?: string | null
          score: number
          metadata?: Record<string, unknown>
          achieved_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          game_mode_id?: string
          player_id?: string | null
          team_id?: string | null
          score?: number
          metadata?: Record<string, unknown>
          achieved_at?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: LeaderboardEntry
      }
      personal_bests: {
        Row: PersonalBest
      }
    }
    Functions: {
      get_leaderboard: {
        Args: {
          mode_id: string
          max_results?: number
        }
        Returns: LeaderboardRank[]
      }
    }
    Enums: {
      score_direction: ScoreDirection
      score_format: ScoreFormat
      game_category: GameCategory
    }
  }
}

// Insert Types (for creating new records) - convenience exports
export type PlayerInsert = Database['public']['Tables']['players']['Insert']
export type TeamInsert = Database['public']['Tables']['teams']['Insert']
export type GameInsert = Database['public']['Tables']['games']['Insert']
export type GameModeInsert = Database['public']['Tables']['game_modes']['Insert']
export type HighScoreInsert = Database['public']['Tables']['high_scores']['Insert']

export type PlayerUpdate = Database['public']['Tables']['players']['Update']
export type TeamUpdate = Database['public']['Tables']['teams']['Update']
export type GameUpdate = Database['public']['Tables']['games']['Update']
export type GameModeUpdate = Database['public']['Tables']['game_modes']['Update']
