import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  Users, 
  Gamepad2, 
  Trophy,
  Layers,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  X
} from 'lucide-react'
import { KioskLayout } from '@/components/layout'
import { ConfirmDialog, PinModal } from '@/components/management'
import { PlayerAvatar } from '@/components/display'
import { useManagePlayers } from '@/hooks/useManagePlayers'
import { useManageGames } from '@/hooks/useManageGames'
import { useManageGameModes } from '@/hooks/useManageGameModes'
import { useManageGameDetails } from '@/hooks/useManageGameDetails'
import { useManageScores, type ScoreWithDetails } from '@/hooks/useManageScores'
import { useKioskStore } from '@/stores/kioskStore'
import { formatScore } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { AvatarUpload } from '@/components/input'
import type { Player, Game, GameMode, GameDetail, GameCategory, ScoreDirection, ScoreFormat } from '@/lib/types'
import { BulkImportModal } from '@/components/management'

type Tab = 'players' | 'games' | 'details' | 'scores'

// Category options for game form
const CATEGORIES: { value: GameCategory; label: string }[] = [
  { value: 'racing', label: 'Racing' },
  { value: 'golf', label: 'Golf' },
  { value: 'party', label: 'Party' },
  { value: 'darts', label: 'Darts' },
  { value: 'pinball', label: 'Pinball' },
  { value: 'platformer', label: 'Platformer' },
  { value: 'rpg', label: 'RPG' },
  { value: 'other', label: 'Other' },
]

const SCORE_FORMATS: { value: ScoreFormat; label: string }[] = [
  { value: 'integer', label: 'Number (47 pts)' },
  { value: 'time_ms', label: 'Time (2:22.567)' },
  { value: 'time_seconds', label: 'Time (2:22)' },
  { value: 'decimal_2', label: 'Decimal (98.45%)' },
  { value: 'golf_relative', label: 'Golf (+3, E, -2)' },
  { value: 'level', label: 'Level (8-4)' },
]

const SCORE_DIRECTIONS: { value: ScoreDirection; label: string }[] = [
  { value: 'lower_better', label: 'Lower is better' },
  { value: 'higher_better', label: 'Higher is better' },
]

/**
 * Manage - Hub for managing players, games, modes, details, and scores
 * Uses tabs to navigate between sections
 */
export function Manage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('players')
  
  // Players state
  const { players, loading: playersLoading, fetchPlayers, createPlayer, updatePlayer, deletePlayer } = useManagePlayers()
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [playerAvatarUrl, setPlayerAvatarUrl] = useState<string | null>(null)
  const [playerPin, setPlayerPin] = useState('')
  const [playerPinError, setPlayerPinError] = useState<string | null>(null)
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null)

  // Games state
  const { games, loading: gamesLoading, fetchGames, createGame, updateGame, deleteGame } = useManageGames()
  const { modes, loading: modesLoading, fetchModes, createMode, updateMode, deleteMode, clearModes } = useManageGameModes()
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [showGameForm, setShowGameForm] = useState(false)
  const [gameName, setGameName] = useState('')
  const [gamePlatform, setGamePlatform] = useState('')
  const [gameCategory, setGameCategory] = useState<GameCategory>('other')
  const [deletingGame, setDeletingGame] = useState<Game | null>(null)

  // Modes state
  const [editingMode, setEditingMode] = useState<GameMode | null>(null)
  const [showModeForm, setShowModeForm] = useState(false)
  const [modeName, setModeName] = useState('')
  const [modeFormat, setModeFormat] = useState<ScoreFormat>('integer')
  const [modeDirection, setModeDirection] = useState<ScoreDirection>('higher_better')
  const [modeUnit, setModeUnit] = useState('')
  const [deletingMode, setDeletingMode] = useState<GameMode | null>(null)

  // Details state
  const { details, loading: detailsLoading, fetchDetails, createDetail, updateDetail, deleteDetail, clearDetails } = useManageGameDetails()
  const [detailsGameId, setDetailsGameId] = useState<string | null>(null)
  const [detailsModeId, setDetailsModeId] = useState<string | null>(null)
  const [editingDetail, setEditingDetail] = useState<GameDetail | null>(null)
  const [showDetailForm, setShowDetailForm] = useState(false)
  const [detailName, setDetailName] = useState('')
  const [detailModeScope, setDetailModeScope] = useState<string | null>(null) // null = all modes, UUID = specific mode
  const [detailOverrideScore, setDetailOverrideScore] = useState(false)
  const [detailFormat, setDetailFormat] = useState<ScoreFormat>('integer')
  const [detailDirection, setDetailDirection] = useState<ScoreDirection>('higher_better')
  const [detailUnit, setDetailUnit] = useState('')
  const [deletingDetail, setDeletingDetail] = useState<GameDetail | null>(null)

// Scores state
  const { scores, loading: scoresLoading, fetchScores, deleteScore } = useManageScores()
  const [deletingScore, setDeletingScore] = useState<ScoreWithDetails | null>(null)
  const [showBulkImport, setShowBulkImport] = useState(false)

  // PIN state
  const { adminPin, setAdminPin, verifyPin } = useKioskStore()
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinMode, setPinMode] = useState<'verify' | 'setup'>('verify')
  const [pinError, setPinError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  // Fetch data on tab change
  useEffect(() => {
    if (activeTab === 'players') {
      fetchPlayers()
    } else if (activeTab === 'games') {
      fetchGames()
    } else if (activeTab === 'details') {
      fetchGames() // Need games list for selector
    } else if (activeTab === 'scores') {
      fetchScores()
    }
  }, [activeTab, fetchPlayers, fetchGames, fetchScores])

  // Fetch modes when game is selected (for games tab)
  useEffect(() => {
    if (selectedGame) {
      fetchModes(selectedGame.id)
    } else {
      clearModes()
    }
  }, [selectedGame, fetchModes, clearModes])

  // Fetch details when game/mode selected (for details tab)
  useEffect(() => {
    if (detailsGameId) {
      fetchDetails(detailsGameId, detailsModeId)
      // Also fetch modes for the mode filter dropdown
      fetchModes(detailsGameId)
    } else {
      clearDetails()
    }
  }, [detailsGameId, detailsModeId, fetchDetails, fetchModes, clearDetails])

  // ============================================================================
  // PIN HELPERS
  // ============================================================================

  const requirePin = (action: () => void) => {
    if (adminPin === null) {
      setPendingAction(() => action)
      setPinMode('setup')
      setShowPinModal(true)
    } else {
      setPendingAction(() => action)
      setPinMode('verify')
      setShowPinModal(true)
    }
  }

  const handlePinSubmit = (pin: string) => {
    if (pinMode === 'setup') {
      setAdminPin(pin)
      setShowPinModal(false)
      setPinError(null)
      if (pendingAction) {
        pendingAction()
        setPendingAction(null)
      }
    } else {
      if (verifyPin(pin)) {
        setShowPinModal(false)
        setPinError(null)
        if (pendingAction) {
          pendingAction()
          setPendingAction(null)
        }
      } else {
        setPinError('Incorrect PIN')
      }
    }
  }

  const handlePinClose = () => {
    setShowPinModal(false)
    setPinError(null)
    setPendingAction(null)
  }

  // ============================================================================
  // PLAYER HANDLERS
  // ============================================================================

  const handleAddPlayer = () => {
    setEditingPlayer(null)
    setPlayerName('')
    setShowPlayerForm(true)
  }

  const handleEditPlayer = (player: Player) => {
  setEditingPlayer(player)
  setPlayerName(player.name)
  setPlayerAvatarUrl(player.avatar_url)
  setPlayerPin('')
  setPlayerPinError(null)
  setShowPlayerForm(true)
}
  
  const handleSavePlayer = async () => {
    if (!playerName.trim()) return
    
    if (editingPlayer) {
      // Optional: set/reset the player's profile PIN (host-only RPC, see supabase/security.sql)
      if (playerPin) {
        if (!/^\d{4}$/.test(playerPin)) {
          setPlayerPinError('PIN must be 4 digits')
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).rpc('set_player_pin', {
          p_player_id: editingPlayer.id,
          p_pin: playerPin,
        })
        if (error) {
          setPlayerPinError(`Couldn't set PIN: ${error.message}`)
          return
        }
      }
      await updatePlayer(editingPlayer.id, playerName.trim(), playerAvatarUrl)
    } else {
      await createPlayer(playerName.trim(), playerAvatarUrl)
    }
    setShowPlayerForm(false)
    setPlayerName('')
    setPlayerAvatarUrl(null)
    setPlayerPin('')
    setPlayerPinError(null)
    setEditingPlayer(null)
}
   
  const handleConfirmDeletePlayer = () => {
    if (!deletingPlayer) return
    requirePin(async () => {
      await deletePlayer(deletingPlayer.id)
      setDeletingPlayer(null)
    })
  }

  // ============================================================================
  // GAME HANDLERS
  // ============================================================================

  const handleAddGame = () => {
    setEditingGame(null)
    setGameName('')
    setGamePlatform('')
    setGameCategory('other')
    setShowGameForm(true)
  }

  const handleEditGame = (game: Game) => {
    setEditingGame(game)
    setGameName(game.name)
    setGamePlatform(game.platform || '')
    setGameCategory(game.category)
    setShowGameForm(true)
  }

  const handleSaveGame = async () => {
    if (!gameName.trim()) return
    
    if (editingGame) {
      await updateGame(editingGame.id, {
        name: gameName.trim(),
        platform: gamePlatform.trim() || null,
        category: gameCategory,
      })
    } else {
      await createGame(gameName.trim(), gameCategory, {
        platform: gamePlatform.trim() || null,
      })
    }
    setShowGameForm(false)
    setGameName('')
    setGamePlatform('')
    setEditingGame(null)
  }

  const handleConfirmDeleteGame = () => {
    if (!deletingGame) return
    const gameToDelete = deletingGame
    requirePin(async () => {
      await deleteGame(gameToDelete.id)
      setDeletingGame(null)
      if (selectedGame?.id === gameToDelete.id) {
        setSelectedGame(null)
      }
    })
  }

  // ============================================================================
  // MODE HANDLERS
  // ============================================================================

  const handleAddMode = () => {
    setEditingMode(null)
    setModeName('')
    setModeFormat('integer')
    setModeDirection('higher_better')
    setModeUnit('')
    setShowModeForm(true)
  }

  const handleEditMode = (mode: GameMode) => {
    setEditingMode(mode)
    setModeName(mode.name)
    setModeFormat(mode.score_format ?? 'integer')
    setModeDirection(mode.score_direction ?? 'higher_better')
    setModeUnit(mode.score_unit || '')
    setShowModeForm(true)
  }

  const handleSaveMode = async () => {
    if (!modeName.trim() || !selectedGame) return
    
    if (editingMode) {
      await updateMode(editingMode.id, {
        name: modeName.trim(),
        score_format: modeFormat,
        score_direction: modeDirection,
        score_unit: modeUnit.trim() || null,
      })
    } else {
      await createMode(
        selectedGame.id,
        modeName.trim(),
        modeFormat,
        modeDirection,
        modeUnit.trim() || null,
        null
      )
    }
    setShowModeForm(false)
    setModeName('')
    setEditingMode(null)
  }

  const handleConfirmDeleteMode = () => {
    if (!deletingMode) return
    const modeToDelete = deletingMode
    requirePin(async () => {
      await deleteMode(modeToDelete.id)
      setDeletingMode(null)
    })
  }

  // ============================================================================
  // DETAIL HANDLERS
  // ============================================================================

  const handleAddDetail = () => {
    setEditingDetail(null)
    setDetailName('')
    setDetailModeScope(null)
    setDetailOverrideScore(false)
    setDetailFormat('integer')
    setDetailDirection('higher_better')
    setDetailUnit('')
    setShowDetailForm(true)
  }

  const handleEditDetail = (detail: GameDetail) => {
    setEditingDetail(detail)
    setDetailName(detail.name)
    setDetailModeScope(detail.mode_id)
    setDetailOverrideScore(!!(detail.score_format || detail.score_direction || detail.score_unit))
    setDetailFormat(detail.score_format ?? 'integer')
    setDetailDirection(detail.score_direction ?? 'higher_better')
    setDetailUnit(detail.score_unit || '')
    setShowDetailForm(true)
  }

  const handleSaveDetail = async () => {
    if (!detailName.trim() || !detailsGameId) return
    
    if (editingDetail) {
      await updateDetail(editingDetail.id, {
        name: detailName.trim(),
        mode_id: detailModeScope,
        score_format: detailOverrideScore ? detailFormat : null,
        score_direction: detailOverrideScore ? detailDirection : null,
        score_unit: detailOverrideScore ? (detailUnit.trim() || null) : null,
      })
    } else {
      await createDetail(
        detailsGameId,
        detailName.trim(),
        detailModeScope,
        detailOverrideScore ? detailFormat : null,
        detailOverrideScore ? detailDirection : null,
        detailOverrideScore ? (detailUnit.trim() || null) : null
      )
    }
    setShowDetailForm(false)
    setDetailName('')
    setEditingDetail(null)
  }

  const handleConfirmDeleteDetail = () => {
    if (!deletingDetail) return
    const detailToDelete = deletingDetail
    requirePin(async () => {
      await deleteDetail(detailToDelete.id)
      setDeletingDetail(null)
    })
  }

  // ============================================================================
  // SCORE HANDLERS
  // ============================================================================

  const handleConfirmDeleteScore = () => {
    if (!deletingScore) return
    const scoreToDelete = deletingScore
    requirePin(async () => {
      await deleteScore(scoreToDelete.id)
      setDeletingScore(null)
    })
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getSelectedDetailsGame = () => games.find(g => g.id === detailsGameId) || null

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="shrink-0 h-[64px] flex items-center px-md border-b border-white/10">
          <button
            onClick={() => navigate('/')}
            className="w-12 h-12 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-text-primary ml-2">Manage</h1>
        </div>

        {/* Tabs */}
        <div className="shrink-0 flex border-b border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 min-w-[80px] h-[56px] flex items-center justify-center gap-2 font-medium transition-colors ${
              activeTab === 'players' 
                ? 'text-category-golf border-b-2 border-category-golf' 
                : 'text-text-muted'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="hidden sm:inline">Players</span>
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`flex-1 min-w-[80px] h-[56px] flex items-center justify-center gap-2 font-medium transition-colors ${
              activeTab === 'games' 
                ? 'text-category-darts border-b-2 border-category-darts' 
                : 'text-text-muted'
            }`}
          >
            <Gamepad2 className="w-5 h-5" />
            <span className="hidden sm:inline">Games</span>
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 min-w-[80px] h-[56px] flex items-center justify-center gap-2 font-medium transition-colors ${
              activeTab === 'details' 
                ? 'text-category-racing border-b-2 border-category-racing' 
                : 'text-text-muted'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="hidden sm:inline">Details</span>
          </button>
          <button
            onClick={() => setActiveTab('scores')}
            className={`flex-1 min-w-[80px] h-[56px] flex items-center justify-center gap-2 font-medium transition-colors ${
              activeTab === 'scores' 
                ? 'text-category-party border-b-2 border-category-party' 
                : 'text-text-muted'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="hidden sm:inline">Scores</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Players Tab */}
            {activeTab === 'players' && (
              <motion.div
                key="players"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col"
              >
                <div className="px-md py-3">
                  <button
                    onClick={handleAddPlayer}
                    className="w-full h-[56px] flex items-center justify-center gap-2 bg-category-golf/20 text-category-golf font-medium rounded-xl active:bg-category-golf/30"
                  >
                    <Plus className="w-5 h-5" />
                    Add Player
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-md pb-4 space-y-2">
                  {playersLoading ? (
                    <p className="text-center text-text-muted py-8">Loading...</p>
                  ) : players.length === 0 ? (
                    <p className="text-center text-text-muted py-8">No players yet</p>
                  ) : (
                    players.map((player) => (
                      <div
                        key={player.id}
                        className="card px-md py-3 flex items-center gap-3"
                      >
                        <PlayerAvatar 
                          name={player.name} 
                          avatarUrl={player.avatar_url} 
                          size={32} 
                        />
                        <span className="flex-1 font-medium text-text-primary truncate">
                          {player.name}
                        </span>
                        <button
                          onClick={() => handleEditPlayer(player)}
                          className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg active:bg-background-elevated"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingPlayer(player)}
                          className="w-10 h-10 flex items-center justify-center text-text-muted active:text-red-500 rounded-lg active:bg-background-elevated"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && (
              <motion.div
                key="games"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex"
              >
                {/* Game list */}
                <div className="w-1/2 h-full flex flex-col border-r border-white/10">
                  <div className="px-md py-3">
                    <button
                      onClick={handleAddGame}
                      className="w-full h-[56px] flex items-center justify-center gap-2 bg-category-darts/20 text-category-darts font-medium rounded-xl active:bg-category-darts/30"
                    >
                      <Plus className="w-5 h-5" />
                      Add Game
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-md pb-4 space-y-2">
                    {gamesLoading ? (
                      <p className="text-center text-text-muted py-8">Loading...</p>
                    ) : games.length === 0 ? (
                      <p className="text-center text-text-muted py-8">No games yet</p>
                    ) : (
                      games.map((game) => (
                        <div
                          key={game.id}
                          onClick={() => setSelectedGame(game)}
                          className={`card px-md py-3 flex items-center gap-3 cursor-pointer ${
                            selectedGame?.id === game.id ? 'ring-2 ring-category-darts' : ''
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary truncate">{game.name}</p>
                            <p className="text-xs text-text-muted">{game.platform || 'No platform'}</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditGame(game) }}
                            className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg active:bg-background-elevated"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeletingGame(game) }}
                            className="w-10 h-10 flex items-center justify-center text-text-muted active:text-red-500 rounded-lg active:bg-background-elevated"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-5 h-5 text-text-muted" />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Mode list */}
                {selectedGame ? (
                  <div className="w-1/2 h-full flex flex-col">
                    <div className="px-md py-3 flex items-center justify-between">
                      <p className="text-sm text-text-muted">{selectedGame.name} — Modes</p>
                      <button
                        onClick={handleAddMode}
                        className="h-10 px-4 flex items-center justify-center gap-1 bg-category-party/20 text-category-party text-sm font-medium rounded-lg active:bg-category-party/30"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-md pb-4 space-y-2">
                      {modesLoading ? (
                        <p className="text-center text-text-muted py-8">Loading...</p>
                      ) : modes.length === 0 ? (
                        <p className="text-center text-text-muted py-8">No modes yet</p>
                      ) : (
                        modes.map((mode) => (
                          <div
                            key={mode.id}
                            className="card px-md py-3 flex items-center gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-text-primary truncate">{mode.name}</p>
                              <p className="text-xs text-text-muted">
                                {SCORE_FORMATS.find(f => f.value === mode.score_format)?.label ?? 'Inherits from game'}
                                {mode.score_unit && ` (${mode.score_unit})`}
                              </p>
                            </div>
                            <button
                              onClick={() => handleEditMode(mode)}
                              className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg active:bg-background-elevated"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingMode(mode)}
                              className="w-10 h-10 flex items-center justify-center text-text-muted active:text-red-500 rounded-lg active:bg-background-elevated"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-1/2 h-full flex items-center justify-center">
                    <p className="text-text-muted">Select a game to manage modes</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col"
              >
                {/* Game and Mode selectors */}
                <div className="px-md py-3 space-y-2">
                  <select
                    value={detailsGameId || ''}
                    onChange={(e) => {
                      setDetailsGameId(e.target.value || null)
                      setDetailsModeId(null)
                    }}
                    className="w-full h-[48px] px-md bg-background-elevated text-text-primary rounded-lg outline-none"
                  >
                    <option value="">Select a game</option>
                    {games.map(game => (
                      <option key={game.id} value={game.id}>{game.name}</option>
                    ))}
                  </select>

                  {detailsGameId && modes.length > 0 && (
                    <select
                      value={detailsModeId || ''}
                      onChange={(e) => setDetailsModeId(e.target.value || null)}
                      className="w-full h-[48px] px-md bg-background-elevated text-text-primary rounded-lg outline-none"
                    >
                      <option value="">All modes</option>
                      {modes.map(mode => (
                        <option key={mode.id} value={mode.id}>{mode.name}</option>
                      ))}
                    </select>
                  )}

                  {detailsGameId && (
                    <button
                      onClick={handleAddDetail}
                      className="w-full h-[48px] flex items-center justify-center gap-2 bg-category-racing/20 text-category-racing font-medium rounded-xl active:bg-category-racing/30"
                    >
                      <Plus className="w-5 h-5" />
                      Add {getSelectedDetailsGame()?.detail_label || 'Detail'}
                    </button>
                  )}
                </div>

                {/* Details list */}
                <div className="flex-1 overflow-y-auto px-md pb-4 space-y-2">
                  {!detailsGameId ? (
                    <p className="text-center text-text-muted py-8">Select a game to manage details</p>
                  ) : detailsLoading ? (
                    <p className="text-center text-text-muted py-8">Loading...</p>
                  ) : details.length === 0 ? (
                    <p className="text-center text-text-muted py-8">
                      No {getSelectedDetailsGame()?.detail_label?.toLowerCase() || 'detail'}s yet
                    </p>
                  ) : (
                    details.map((detail) => (
                      <div
                        key={detail.id}
                        className="card px-md py-3 flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary truncate">{detail.name}</p>
                          <p className="text-xs text-text-muted">
                            {detail.mode_id 
                              ? `${modes.find(m => m.id === detail.mode_id)?.name || 'Specific mode'} only`
                              : 'All modes'
                            }
                            {detail.score_format && ` • ${SCORE_FORMATS.find(f => f.value === detail.score_format)?.label}`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEditDetail(detail)}
                          className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg active:bg-background-elevated"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingDetail(detail)}
                          className="w-10 h-10 flex items-center justify-center text-text-muted active:text-red-500 rounded-lg active:bg-background-elevated"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Scores Tab */}
            {activeTab === 'scores' && (
              <motion.div
                key="scores"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col"
              >
                
              <div className="px-md py-3 flex items-center justify-between">
                  <p className="text-sm text-text-muted">Recent scores — tap to delete</p>
                  <button
                    onClick={() => setShowBulkImport(true)}
                    className="text-sm text-category-golf font-medium active:opacity-70"
                  >
                    Bulk Import
                  </button>
                </div>  

                <div className="flex-1 overflow-y-auto px-md pb-4 space-y-2">
                  {scoresLoading ? (
                    <p className="text-center text-text-muted py-8">Loading...</p>
                  ) : scores.length === 0 ? (
                    <p className="text-center text-text-muted py-8">No scores yet</p>
                  ) : (
                    scores.map((score) => (
                      <div
                        key={score.id}
                        className="card px-md py-3 flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary truncate">
                            {score.player_name || 'Unknown'} — {formatScore(score.score, score.score_format, score.score_unit)}
                          </p>
                          <p className="text-xs text-text-muted truncate">
                            {score.game_name}
                            {score.mode_name && ` • ${score.mode_name}`}
                            {score.detail_name && ` • ${score.detail_name}`}
                          </p>
                        </div>
                        <button
                          onClick={() => setDeletingScore(score)}
                          className="w-10 h-10 flex items-center justify-center text-text-muted active:text-red-500 rounded-lg active:bg-background-elevated"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Player Form Modal */}
      {/* Player Form Modal */}
      <AnimatePresence>
        {showPlayerForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-md"
            onClick={() => { setShowPlayerForm(false); setPlayerAvatarUrl(null) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] bg-background-card rounded-xl p-lg"
              style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">
                  {editingPlayer ? 'Edit Player' : 'Add Player'}
                </h2>
                <button
                  onClick={() => { setShowPlayerForm(false); setPlayerAvatarUrl(null) }}
                  className="w-8 h-8 flex items-center justify-center text-text-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Avatar upload */}
              <div className="flex justify-center mb-4">
                <AvatarUpload
                  currentUrl={playerAvatarUrl}
                  playerName={playerName || 'New Player'}
                  onChange={setPlayerAvatarUrl}
                  playerId={editingPlayer?.id}
                />
              </div>

              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Player name"
                autoFocus
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-4 outline-none focus:ring-2 focus:ring-category-golf"
              />
              {editingPlayer && (
                <div className="mb-4">
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    value={playerPin}
                    onChange={(e) => {
                      setPlayerPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                      setPlayerPinError(null)
                    }}
                    placeholder="New profile PIN (optional)"
                    className="w-full h-[48px] px-md bg-background-elevated text-text-primary rounded-lg outline-none focus:ring-2 focus:ring-category-golf"
                  />
                  <p className={`mt-1 text-xs ${playerPinError ? 'text-red-400' : 'text-text-muted'}`}>
                    {playerPinError ?? 'Sets or resets the PIN this player uses to edit their profile'}
                  </p>
                </div>
              )}
              <button
                onClick={handleSavePlayer}
                disabled={!playerName.trim()}
                className="w-full h-[56px] bg-category-golf text-white font-semibold rounded-lg disabled:opacity-50"
              >
                {editingPlayer ? 'Save Changes' : 'Add Player'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Form Modal */}
      <AnimatePresence>
        {showGameForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-md"
            onClick={() => setShowGameForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] bg-background-card rounded-xl p-lg"
              style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">
                  {editingGame ? 'Edit Game' : 'Add Game'}
                </h2>
                <button
                  onClick={() => setShowGameForm(false)}
                  className="w-8 h-8 flex items-center justify-center text-text-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Game name"
                autoFocus
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none focus:ring-2 focus:ring-category-darts"
              />
              <input
                type="text"
                value={gamePlatform}
                onChange={(e) => setGamePlatform(e.target.value)}
                placeholder="Platform (optional)"
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none focus:ring-2 focus:ring-category-darts"
              />
              <select
                value={gameCategory}
                onChange={(e) => setGameCategory(e.target.value as GameCategory)}
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-4 outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <button
                onClick={handleSaveGame}
                disabled={!gameName.trim()}
                className="w-full h-[56px] bg-category-darts text-white font-semibold rounded-lg disabled:opacity-50"
              >
                {editingGame ? 'Save Changes' : 'Add Game'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Form Modal */}
      <AnimatePresence>
        {showModeForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-md overflow-y-auto"
            onClick={() => setShowModeForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] bg-background-card rounded-xl p-lg my-4"
              style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">
                  {editingMode ? 'Edit Mode' : 'Add Mode'}
                </h2>
                <button
                  onClick={() => setShowModeForm(false)}
                  className="w-8 h-8 flex items-center justify-center text-text-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={modeName}
                onChange={(e) => setModeName(e.target.value)}
                placeholder="Mode name (e.g. Rainbow Road)"
                autoFocus
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none focus:ring-2 focus:ring-category-party"
              />
              <select
                value={modeFormat}
                onChange={(e) => setModeFormat(e.target.value as ScoreFormat)}
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none"
              >
                {SCORE_FORMATS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <select
                value={modeDirection}
                onChange={(e) => setModeDirection(e.target.value as ScoreDirection)}
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none"
              >
                {SCORE_DIRECTIONS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={modeUnit}
                onChange={(e) => setModeUnit(e.target.value)}
                placeholder="Unit (e.g. pts, throws, %)"
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-4 outline-none focus:ring-2 focus:ring-category-party"
              />
              <button
                onClick={handleSaveMode}
                disabled={!modeName.trim()}
                className="w-full h-[56px] bg-category-party text-black font-semibold rounded-lg disabled:opacity-50"
              >
                {editingMode ? 'Save Changes' : 'Add Mode'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Form Modal */}
      <AnimatePresence>
        {showDetailForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-md overflow-y-auto"
            onClick={() => setShowDetailForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] bg-background-card rounded-xl p-lg my-4"
              style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">
                  {editingDetail ? 'Edit' : 'Add'} {getSelectedDetailsGame()?.detail_label || 'Detail'}
                </h2>
                <button
                  onClick={() => setShowDetailForm(false)}
                  className="w-8 h-8 flex items-center justify-center text-text-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <input
                type="text"
                value={detailName}
                onChange={(e) => setDetailName(e.target.value)}
                placeholder={`${getSelectedDetailsGame()?.detail_label || 'Detail'} name`}
                autoFocus
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none focus:ring-2 focus:ring-category-racing"
              />

              <label className="block text-sm text-text-secondary mb-2">Available for</label>
              <select
                value={detailModeScope || ''}
                onChange={(e) => setDetailModeScope(e.target.value || null)}
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none"
              >
                <option value="">All modes in this game</option>
                {modes.map(mode => (
                  <option key={mode.id} value={mode.id}>{mode.name} only</option>
                ))}
              </select>

              <label className="flex items-center gap-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={detailOverrideScore}
                  onChange={(e) => setDetailOverrideScore(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="text-text-primary">Override score settings</span>
              </label>

              {detailOverrideScore && (
                <>
                  <select
                    value={detailFormat}
                    onChange={(e) => setDetailFormat(e.target.value as ScoreFormat)}
                    className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none"
                  >
                    {SCORE_FORMATS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  <select
                    value={detailDirection}
                    onChange={(e) => setDetailDirection(e.target.value as ScoreDirection)}
                    className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none"
                  >
                    {SCORE_DIRECTIONS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={detailUnit}
                    onChange={(e) => setDetailUnit(e.target.value)}
                    placeholder="Unit (e.g. pts, throws, %)"
                    className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none focus:ring-2 focus:ring-category-racing"
                  />
                </>
              )}

              <button
                onClick={handleSaveDetail}
                disabled={!detailName.trim()}
                className="w-full h-[56px] bg-category-racing text-white font-semibold rounded-lg disabled:opacity-50 mt-2"
              >
                {editingDetail ? 'Save Changes' : 'Add'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmations */}
      <ConfirmDialog
        isOpen={!!deletingPlayer}
        onClose={() => setDeletingPlayer(null)}
        onConfirm={handleConfirmDeletePlayer}
        title="Delete Player?"
        message={`This will permanently delete "${deletingPlayer?.name}" and all their scores. This cannot be undone.`}
      />

      <ConfirmDialog
        isOpen={!!deletingGame}
        onClose={() => setDeletingGame(null)}
        onConfirm={handleConfirmDeleteGame}
        title="Delete Game?"
        message={`This will hide "${deletingGame?.name}" and all its modes. Existing scores will be preserved.`}
        confirmLabel="Delete"
      />

      <ConfirmDialog
        isOpen={!!deletingMode}
        onClose={() => setDeletingMode(null)}
        onConfirm={handleConfirmDeleteMode}
        title="Delete Mode?"
        message={`This will hide "${deletingMode?.name}". Existing scores will be preserved.`}
        confirmLabel="Delete"
      />

      <ConfirmDialog
        isOpen={!!deletingDetail}
        onClose={() => setDeletingDetail(null)}
        onConfirm={handleConfirmDeleteDetail}
        title="Delete Detail?"
        message={`This will hide "${deletingDetail?.name}". Existing scores will be preserved.`}
        confirmLabel="Delete"
      />

      <ConfirmDialog
        isOpen={!!deletingScore}
        onClose={() => setDeletingScore(null)}
        onConfirm={handleConfirmDeleteScore}
        title="Delete Score?"
        message={`Delete ${deletingScore?.player_name}'s score of ${deletingScore ? formatScore(deletingScore.score, deletingScore.score_format, deletingScore.score_unit) : ''}?`}
        confirmLabel="Delete"
      />

      {/* PIN Modal */}
      <PinModal
        isOpen={showPinModal}
        onClose={handlePinClose}
        onSubmit={handlePinSubmit}
        mode={pinMode}
        error={pinError}
      />

            {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onSuccess={() => {
          fetchScores()
        }}
      />
    </KioskLayout>
  )
}