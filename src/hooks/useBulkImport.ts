import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { parseScore } from '@/lib/scoreParser'
import type { ScoreFormat } from '@/lib/types'

// Types for the import process
export interface ImportRow {
  rowNumber: number
  player: string
  game: string
  mode: string
  detail?: string
  scoreRaw: string
  playerId?: string
  gameId?: string
  modeId?: string
  detailId?: string
  scoreParsed?: number
  scoreFormat?: ScoreFormat
  errors: string[]
  warnings: string[]
  isValid: boolean
}

export interface ImportSummary {
  total: number
  valid: number
  invalid: number
  warnings: number
}

// Lookup types for matching
interface PlayerLookup {
  id: string
  name: string
  nameLower: string
}

interface GameLookup {
  id: string
  name: string
  nameLower: string
  default_score_format: ScoreFormat
}

interface ModeLookup {
  id: string
  name: string
  nameLower: string
  game_id: string
  score_format: ScoreFormat | null
}

interface DetailLookup {
  id: string
  name: string
  nameLower: string
  game_id: string
  mode_id: string | null
  score_format: ScoreFormat | null
}

interface UseBulkImportResult {
  rows: ImportRow[]
  summary: ImportSummary
  parsing: boolean
  importing: boolean
  error: string | null
  parseInput: (input: string) => Promise<void>
  importRows: () => Promise<{ success: number; failed: number }>
  clearRows: () => void
}

/**
 * Fuzzy match a name against a list of options
 */
function fuzzyMatch<T extends { nameLower: string }>(
  input: string,
  options: T[]
): T | null {
  const inputLower = input.toLowerCase().trim()
  
  const exact = options.find(o => o.nameLower === inputLower)
  if (exact) return exact
  
  const contains = options.find(o => 
    o.nameLower.includes(inputLower) || inputLower.includes(o.nameLower)
  )
  if (contains) return contains
  
  const inputWords = inputLower.split(/\s+/)
  for (const option of options) {
    const optionWords = option.nameLower.split(/\s+/)
    if (inputWords.some(w => optionWords.some(ow => ow.includes(w) || w.includes(ow)))) {
      return option
    }
  }
  
  return null
}

/**
 * Parse CSV string into rows
 */
function parseCSV(input: string): Record<string, string>[] {
  const lines = input.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  
  const headerLine = lines[0]
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase())
  
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const values = line.split(',').map(v => v.trim())
    
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    rows.push(row)
  }
  
  return rows
}

/**
 * Parse JSON string into rows
 */
function parseJSON(input: string): Record<string, string>[] {
  const data = JSON.parse(input)
  
  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array of objects')
  }
  
  return data.map(item => {
    const row: Record<string, string> = {}
    for (const [key, value] of Object.entries(item)) {
      row[key.toLowerCase()] = String(value)
    }
    return row
  })
}

/**
 * Detect if input is JSON or CSV
 */
function detectFormat(input: string): 'json' | 'csv' {
  const trimmed = input.trim()
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return 'json'
  }
  return 'csv'
}

/**
 * useBulkImport - Parse, validate, and import scores in bulk
 */
export function useBulkImport(): UseBulkImportResult {
  const [rows, setRows] = useState<ImportRow[]>([])
  const [summary, setSummary] = useState<ImportSummary>({ total: 0, valid: 0, invalid: 0, warnings: 0 })
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseInput = useCallback(async (input: string) => {
    setParsing(true)
    setError(null)
    setRows([])
    
    try {
      const format = detectFormat(input)
      let rawRows: Record<string, string>[]
      
      try {
        rawRows = format === 'json' ? parseJSON(input) : parseCSV(input)
      } catch (e) {
        throw new Error(`Failed to parse ${format.toUpperCase()}: ${e instanceof Error ? e.message : 'Invalid format'}`)
      }
      
      if (rawRows.length === 0) {
        throw new Error('No data rows found')
      }
      
      const firstRow = rawRows[0]
      const hasPlayer = 'player' in firstRow
      const hasGame = 'game' in firstRow
      const hasMode = 'mode' in firstRow
      const hasScore = 'score' in firstRow
      
      if (!hasPlayer || !hasGame || !hasMode || !hasScore) {
        const missing = []
        if (!hasPlayer) missing.push('player')
        if (!hasGame) missing.push('game')
        if (!hasMode) missing.push('mode')
        if (!hasScore) missing.push('score')
        throw new Error(`Missing required columns: ${missing.join(', ')}`)
      }
      
      // Fetch lookup data using (supabase as any) pattern from existing codebase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any
      
      const playersRes = await sb.from('players').select('id, name').eq('is_active', true)
      const gamesRes = await sb.from('games').select('id, name, default_score_format').eq('is_active', true)
      const modesRes = await sb.from('game_modes').select('id, name, game_id, score_format').eq('is_active', true)
      const detailsRes = await sb.from('game_details').select('id, name, game_id, mode_id, score_format').eq('is_active', true)
      
      // Build lookup arrays
      const players: PlayerLookup[] = []
      const playersData = playersRes.data || []
      for (let i = 0; i < playersData.length; i++) {
        const p = playersData[i]
        players.push({
          id: p.id,
          name: p.name,
          nameLower: p.name.toLowerCase(),
        })
      }
      
      const games: GameLookup[] = []
      const gameFormats: Record<string, ScoreFormat> = {}
      const gamesData = gamesRes.data || []
      for (let i = 0; i < gamesData.length; i++) {
        const g = gamesData[i]
        games.push({
          id: g.id,
          name: g.name,
          nameLower: g.name.toLowerCase(),
          default_score_format: g.default_score_format,
        })
        gameFormats[g.id] = g.default_score_format
      }
      
      const modes: ModeLookup[] = []
      const modesData = modesRes.data || []
      for (let i = 0; i < modesData.length; i++) {
        const m = modesData[i]
        modes.push({
          id: m.id,
          name: m.name,
          nameLower: m.name.toLowerCase(),
          game_id: m.game_id,
          score_format: m.score_format,
        })
      }
      
      const details: DetailLookup[] = []
      const detailsData = detailsRes.data || []
      for (let i = 0; i < detailsData.length; i++) {
        const d = detailsData[i]
        details.push({
          id: d.id,
          name: d.name,
          nameLower: d.name.toLowerCase(),
          game_id: d.game_id,
          mode_id: d.mode_id,
          score_format: d.score_format,
        })
      }
      
      // Process each row
      const processedRows: ImportRow[] = []
      for (let index = 0; index < rawRows.length; index++) {
        const raw = rawRows[index]
        const row: ImportRow = {
          rowNumber: index + 2,
          player: raw.player || '',
          game: raw.game || '',
          mode: raw.mode || '',
          detail: raw.detail || raw.track || raw.course || '',
          scoreRaw: raw.score || '',
          errors: [],
          warnings: [],
          isValid: true,
        }
        
        // Match player
        const playerMatch = fuzzyMatch(row.player, players)
        if (playerMatch) {
          row.playerId = playerMatch.id
          if (playerMatch.nameLower !== row.player.toLowerCase()) {
            row.warnings.push(`Player matched to "${playerMatch.name}"`)
          }
        } else {
          row.errors.push(`Player "${row.player}" not found`)
          row.isValid = false
        }
        
        // Match game
        const gameMatch = fuzzyMatch(row.game, games)
        if (gameMatch) {
          row.gameId = gameMatch.id
          if (gameMatch.nameLower !== row.game.toLowerCase()) {
            row.warnings.push(`Game matched to "${gameMatch.name}"`)
          }
        } else {
          row.errors.push(`Game "${row.game}" not found`)
          row.isValid = false
        }
        
        // Match mode (filtered by game)
        if (row.gameId) {
          const gameModes = modes.filter(m => m.game_id === row.gameId)
          const modeMatch = fuzzyMatch(row.mode, gameModes)
          if (modeMatch) {
            row.modeId = modeMatch.id
            row.scoreFormat = modeMatch.score_format || gameFormats[row.gameId] || 'integer'
            if (modeMatch.nameLower !== row.mode.toLowerCase()) {
              row.warnings.push(`Mode matched to "${modeMatch.name}"`)
            }
          } else {
            row.errors.push(`Mode "${row.mode}" not found for this game`)
            row.isValid = false
          }
        }
        
        // Match detail (optional)
        if (row.detail && row.gameId) {
          const gameDetails = details.filter(d => 
            d.game_id === row.gameId && 
            (d.mode_id === null || d.mode_id === row.modeId)
          )
          const detailMatch = fuzzyMatch(row.detail, gameDetails)
          if (detailMatch) {
            row.detailId = detailMatch.id
            if (detailMatch.score_format) {
              row.scoreFormat = detailMatch.score_format
            }
            if (detailMatch.nameLower !== row.detail.toLowerCase()) {
              row.warnings.push(`Detail matched to "${detailMatch.name}"`)
            }
          } else {
            row.warnings.push(`Detail "${row.detail}" not found (will be ignored)`)
          }
        }
        
        // Parse score
        if (row.scoreFormat) {
          const parseResult = parseScore(row.scoreRaw, row.scoreFormat)
          if (parseResult.success && parseResult.value !== null) {
            row.scoreParsed = parseResult.value
          } else {
            row.errors.push(parseResult.error || 'Invalid score')
            row.isValid = false
          }
        } else if (row.isValid) {
          const parseResult = parseScore(row.scoreRaw, 'integer')
          if (parseResult.success && parseResult.value !== null) {
            row.scoreParsed = parseResult.value
            row.scoreFormat = 'integer'
          } else {
            row.errors.push('Could not parse score')
            row.isValid = false
          }
        }
        
        processedRows.push(row)
      }
      
      const validCount = processedRows.filter(r => r.isValid).length
      const warningCount = processedRows.filter(r => r.warnings.length > 0).length
      
      setRows(processedRows)
      setSummary({
        total: processedRows.length,
        valid: validCount,
        invalid: processedRows.length - validCount,
        warnings: warningCount,
      })
      
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse input')
      setRows([])
      setSummary({ total: 0, valid: 0, invalid: 0, warnings: 0 })
    } finally {
      setParsing(false)
    }
  }, [])

  const importRows = useCallback(async (): Promise<{ success: number; failed: number }> => {
    setImporting(true)
    
    const validRows = rows.filter(r => r.isValid)
    let success = 0
    let failed = 0
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any
      
      const chunkSize = 50
      for (let i = 0; i < validRows.length; i += chunkSize) {
        const chunk = validRows.slice(i, i + chunkSize)
        
        const inserts = []
        for (let j = 0; j < chunk.length; j++) {
          const row = chunk[j]
          inserts.push({
            player_id: row.playerId,
            game_id: row.gameId,
            mode_id: row.modeId,
            detail_id: row.detailId || null,
            score: row.scoreParsed,
            achieved_at: new Date().toISOString(),
          })
        }
        
        const { error: insertError } = await sb
          .from('high_scores')
          .insert(inserts)
        
        if (insertError) {
          console.error('Batch insert error:', insertError)
          failed += chunk.length
        } else {
          success += chunk.length
        }
      }
    } catch (e) {
      console.error('Import error:', e)
    } finally {
      setImporting(false)
    }
    
    return { success, failed }
  }, [rows])

  const clearRows = useCallback(() => {
    setRows([])
    setSummary({ total: 0, valid: 0, invalid: 0, warnings: 0 })
    setError(null)
  }, [])

  return {
    rows,
    summary,
    parsing,
    importing,
    error,
    parseInput,
    importRows,
    clearRows,
  }
}