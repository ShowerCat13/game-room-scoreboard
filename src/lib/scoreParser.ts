import type { ScoreFormat } from '@/lib/types'

interface ParseResult {
  success: boolean
  value: number | null
  error?: string
}

/**
 * Parse a time string into milliseconds
 * Accepts: "1:23.456", "83.456", "83456" (raw ms), "1:23" (no ms)
 */
function parseTimeMs(input: string): ParseResult {
  const trimmed = input.trim()
  
  // Try M:SS.mmm or M:SS format
  const colonMatch = trimmed.match(/^(\d+):(\d{1,2})(?:\.(\d{1,3}))?$/)
  if (colonMatch) {
    const minutes = parseInt(colonMatch[1], 10)
    const seconds = parseInt(colonMatch[2], 10)
    const ms = colonMatch[3] ? parseInt(colonMatch[3].padEnd(3, '0'), 10) : 0
    
    if (seconds >= 60) {
      return { success: false, value: null, error: 'Seconds must be < 60' }
    }
    
    const totalMs = (minutes * 60 * 1000) + (seconds * 1000) + ms
    return { success: true, value: totalMs }
  }
  
  // Try SS.mmm format (seconds with decimal)
  const decimalMatch = trimmed.match(/^(\d+)\.(\d{1,3})$/)
  if (decimalMatch) {
    const seconds = parseInt(decimalMatch[1], 10)
    const ms = parseInt(decimalMatch[2].padEnd(3, '0'), 10)
    const totalMs = (seconds * 1000) + ms
    return { success: true, value: totalMs }
  }
  
  // Try raw milliseconds (integer)
  const rawMs = parseInt(trimmed, 10)
  if (!isNaN(rawMs) && trimmed === rawMs.toString()) {
    return { success: true, value: rawMs }
  }
  
  return { 
    success: false, 
    value: null, 
    error: 'Expected format: M:SS.mmm, SS.mmm, or milliseconds' 
  }
}

/**
 * Parse a time string into seconds
 * Accepts: "4:56", "296", "4:56.5" (rounds to seconds)
 */
function parseTimeSeconds(input: string): ParseResult {
  const trimmed = input.trim()
  
  // Try M:SS format
  const colonMatch = trimmed.match(/^(\d+):(\d{1,2})(?:\.\d+)?$/)
  if (colonMatch) {
    const minutes = parseInt(colonMatch[1], 10)
    const seconds = parseInt(colonMatch[2], 10)
    
    if (seconds >= 60) {
      return { success: false, value: null, error: 'Seconds must be < 60' }
    }
    
    const totalSeconds = (minutes * 60) + seconds
    return { success: true, value: totalSeconds }
  }
  
  // Try raw seconds (integer)
  const rawSeconds = parseInt(trimmed, 10)
  if (!isNaN(rawSeconds)) {
    return { success: true, value: rawSeconds }
  }
  
  return { 
    success: false, 
    value: null, 
    error: 'Expected format: M:SS or seconds' 
  }
}

/**
 * Parse a golf score (relative to par)
 * Accepts: "-6", "+2", "0", "E" (even = 0)
 */
function parseGolfRelative(input: string): ParseResult {
  const trimmed = input.trim().toUpperCase()
  
  // E or EVEN = 0
  if (trimmed === 'E' || trimmed === 'EVEN' || trimmed === 'PAR') {
    return { success: true, value: 0 }
  }
  
  // Parse signed integer
  const value = parseInt(trimmed, 10)
  if (!isNaN(value)) {
    return { success: true, value }
  }
  
  return { 
    success: false, 
    value: null, 
    error: 'Expected: -6, +2, 0, or E' 
  }
}

/**
 * Parse a decimal score (stored as integer × 100)
 * Accepts: "98.45", "100", "78.5"
 */
function parseDecimal2(input: string): ParseResult {
  const trimmed = input.trim()
  
  // Remove % sign if present
  const cleaned = trimmed.replace(/%$/, '')
  
  const value = parseFloat(cleaned)
  if (!isNaN(value)) {
    // Multiply by 100 and round to avoid floating point issues
    const stored = Math.round(value * 100)
    return { success: true, value: stored }
  }
  
  return { 
    success: false, 
    value: null, 
    error: 'Expected decimal number (e.g., 98.45)' 
  }
}

/**
 * Parse an integer score
 * Accepts: "1000", "47", "-5"
 */
function parseInteger(input: string): ParseResult {
  const trimmed = input.trim()
  
  // Remove common suffixes
  const cleaned = trimmed.replace(/\s*(pts?|points?|kills?|elims?)\.?$/i, '')
  
  const value = parseInt(cleaned, 10)
  if (!isNaN(value) && cleaned === value.toString()) {
    return { success: true, value }
  }
  
  return { 
    success: false, 
    value: null, 
    error: 'Expected integer' 
  }
}

/**
 * Parse a level score (World X-Y format)
 * Accepts: "8-4", "World 8-4", "8-4"
 * Stored as: world * 100 + level (e.g., 8-4 = 804)
 */
function parseLevel(input: string): ParseResult {
  const trimmed = input.trim()
  
  // Try X-Y format
  const match = trimmed.match(/(?:world\s*)?(\d+)-(\d+)/i)
  if (match) {
    const world = parseInt(match[1], 10)
    const level = parseInt(match[2], 10)
    
    if (world > 99 || level > 99) {
      return { success: false, value: null, error: 'World/level must be < 100' }
    }
    
    const stored = (world * 100) + level
    return { success: true, value: stored }
  }
  
  // Try raw encoded value
  const raw = parseInt(trimmed, 10)
  if (!isNaN(raw) && raw > 0) {
    return { success: true, value: raw }
  }
  
  return { 
    success: false, 
    value: null, 
    error: 'Expected format: X-Y or World X-Y' 
  }
}

/**
 * Parse a score string based on the score format
 */
export function parseScore(input: string, format: ScoreFormat): ParseResult {
  if (!input || input.trim() === '') {
    return { success: false, value: null, error: 'Score is required' }
  }
  
  switch (format) {
    case 'time_ms':
      return parseTimeMs(input)
    case 'time_seconds':
      return parseTimeSeconds(input)
    case 'golf_relative':
      return parseGolfRelative(input)
    case 'decimal_2':
      return parseDecimal2(input)
    case 'level':
      return parseLevel(input)
    case 'integer':
    default:
      return parseInteger(input)
  }
}

/**
 * Get help text for a score format
 */
export function getFormatHelpText(format: ScoreFormat): string {
  switch (format) {
    case 'time_ms':
      return 'Enter as M:SS.mmm (e.g., 1:23.456) or total milliseconds'
    case 'time_seconds':
      return 'Enter as M:SS (e.g., 4:56) or total seconds'
    case 'golf_relative':
      return 'Enter relative to par (e.g., -6, +2, 0, or E for even)'
    case 'decimal_2':
      return 'Enter as decimal (e.g., 98.45)'
    case 'level':
      return 'Enter as X-Y (e.g., 8-4 or World 8-4)'
    case 'integer':
    default:
      return 'Enter as whole number'
  }
}

/**
 * Format examples for documentation
 */
export const SCORE_FORMAT_EXAMPLES: Record<ScoreFormat, string[]> = {
  integer: ['1000', '47', '250'],
  time_ms: ['1:23.456', '83.456', '83456'],
  time_seconds: ['4:56', '296'],
  decimal_2: ['98.45', '100', '78.5'],
  golf_relative: ['-6', '+2', '0', 'E'],
  level: ['8-4', 'World 8-4'],
}