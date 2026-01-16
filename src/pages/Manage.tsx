import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  Users, 
  Gamepad2, 
  Trophy,
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
import { useManageScores, type ScoreWithDetails } from '@/hooks/useManageScores'
import { useKioskStore } from '@/stores/kioskStore'
import { formatScore, getInitials, getPlayerColor } from '@/lib/utils'
import type { Player, Game, GameMode, GameCategory, ScoreDirection, ScoreFormat } from '@/lib/types'

type Tab = 'players' | 'games' | 'scores'

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
  { value: 'level', label: 'Level (8-4)' },
]

const SCORE_DIRECTIONS: { value: ScoreDirection; label: string }[] = [
  { value: 'lower_better', label: 'Lower is better' },
  { value: 'higher_better', label: 'Higher is better' },
]

/**
 * Manage - Hub for managing players, games, modes, and scores
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
  const [modeSubtitle, setModeSubtitle] = useState('')
  const [modeFormat, setModeFormat] = useState<ScoreFormat>('integer')
  const [modeDirection, setModeDirection] = useState<ScoreDirection>('higher_better')
  const [modeUnit, setModeUnit] = useState('')
  const [deletingMode, setDeletingMode] = useState<GameMode | null>(null)

  // Scores state
  const { scores, loading: scoresLoading, fetchScores, deleteScore } = useManageScores()
  const [deletingScore, setDeletingScore] = useState<ScoreWithDetails | null>(null)

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
    } else if (activeTab === 'scores') {
      fetchScores()
    }
  }, [activeTab, fetchPlayers, fetchGames, fetchScores])

  // Fetch modes when game is selected
  useEffect(() => {
    if (selectedGame) {
      fetchModes(selectedGame.id)
    } else {
      clearModes()
    }
  }, [selectedGame, fetchModes, clearModes])

  // ============================================================================
  // PIN HELPERS
  // ============================================================================

  const requirePin = (action: () => void) => {
    if (adminPin === null) {
      // No PIN set, require setup first
      setPendingAction(() => action)
      setPinMode('setup')
      setShowPinModal(true)
    } else {
      // PIN is set, require verification
      setPendingAction(() => action)
      setPinMode('verify')
      setShowPinModal(true)
    }
  }

  const handlePinSubmit = (pin: string) => {
    if (pinMode === 'setup') {
      // Setting up new PIN
      setAdminPin(pin)
      setShowPinModal(false)
      setPinError(null)
      // Execute the pending action
      if (pendingAction) {
        pendingAction()
        setPendingAction(null)
      }
    } else {
      // Verifying existing PIN
      if (verifyPin(pin)) {
        setShowPinModal(false)
        setPinError(null)
        // Execute the pending action
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
    setShowPlayerForm(true)
  }

  const handleSavePlayer = async () => {
    if (!playerName.trim()) return
    
    if (editingPlayer) {
      await updatePlayer(editingPlayer.id, playerName.trim())
    } else {
      await createPlayer(playerName.trim())
    }
    setShowPlayerForm(false)
    setPlayerName('')
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
      await createGame(gameName.trim(), gameCategory, gamePlatform.trim() || null)
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
    setModeSubtitle('')
    setModeFormat('integer')
    setModeDirection('higher_better')
    setModeUnit('')
    setShowModeForm(true)
  }

  const handleEditMode = (mode: GameMode) => {
    setEditingMode(mode)
    setModeName(mode.name)
    setModeSubtitle(mode.subtitle || '')
    setModeFormat(mode.score_format)
    setModeDirection(mode.score_direction)
    setModeUnit(mode.score_unit || '')
    setShowModeForm(true)
  }

  const handleSaveMode = async () => {
    if (!modeName.trim() || !selectedGame) return
    
    if (editingMode) {
      await updateMode(editingMode.id, {
        name: modeName.trim(),
        subtitle: modeSubtitle.trim() || null,
        score_format: modeFormat,
        score_direction: modeDirection,
        score_unit: modeUnit.trim() || null,
      })
    } else {
      await createMode(
        selectedGame.id,
        modeName.trim(),
        modeDirection,
        modeFormat,
        modeSubtitle.trim() || null,
        modeUnit.trim() || null
      )
    }
    setShowModeForm(false)
    setModeName('')
    setModeSubtitle('')
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
  // RENDER
  // ============================================================================

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-[56px] px-sm flex items-center border-b border-background-elevated/50">
          <button
            onClick={() => navigate('/settings')}
            className="min-h-[48px] px-sm flex items-center gap-1 text-text-secondary active:text-text-primary transition-colors rounded-lg active:bg-background-elevated"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-base">Settings</span>
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-text-primary pr-[80px]">
            Manage
          </h1>
        </div>

        {/* Tabs */}
        <div className="h-[56px] px-md flex items-center gap-2 border-b border-background-elevated/30">
          {[
            { id: 'players' as Tab, label: 'Players', icon: Users },
            { id: 'games' as Tab, label: 'Games', icon: Gamepad2 },
            { id: 'scores' as Tab, label: 'Scores', icon: Trophy },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id)
                setSelectedGame(null)
              }}
              className={`
                flex-1 h-[44px] flex items-center justify-center gap-2 rounded-lg font-medium transition-all
                ${activeTab === id 
                  ? 'bg-background-elevated text-text-primary' 
                  : 'text-text-muted active:bg-background-elevated/50'}
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
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
                {/* Add button */}
                <div className="px-md py-3">
                  <button
                    onClick={handleAddPlayer}
                    className="w-full h-[48px] flex items-center justify-center gap-2 bg-category-golf/20 text-category-golf font-semibold rounded-lg active:bg-category-golf/30 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Player</span>
                  </button>
                </div>

                {/* Player list */}
                <div className="flex-1 overflow-y-auto px-md pb-4 space-y-2">
                  {playersLoading ? (
                    <p className="text-center text-text-muted py-8">Loading...</p>
                  ) : players.length === 0 ? (
                    <p className="text-center text-text-muted py-8">No players yet</p>
                  ) : (
                    players.map((player) => (
                      <div
                        key={player.id}
                        className="card h-[64px] px-md flex items-center gap-3"
                      >
                        <PlayerAvatar
                          name={player.name}
                          avatarUrl={player.avatar_url}
                          size={40}
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
                className="h-full flex flex-col"
              >
                {!selectedGame ? (
                  <>
                    {/* Add game button */}
                    <div className="px-md py-3">
                      <button
                        onClick={handleAddGame}
                        className="w-full h-[48px] flex items-center justify-center gap-2 bg-category-darts/20 text-category-darts font-semibold rounded-lg active:bg-category-darts/30 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add Game</span>
                      </button>
                    </div>

                    {/* Game list */}
                    <div className="flex-1 overflow-y-auto px-md pb-4 space-y-2">
                      {gamesLoading ? (
                        <p className="text-center text-text-muted py-8">Loading...</p>
                      ) : games.length === 0 ? (
                        <p className="text-center text-text-muted py-8">No games yet</p>
                      ) : (
                        games.map((game) => (
                          <div
                            key={game.id}
                            className="card h-[64px] px-md flex items-center gap-3"
                          >
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ backgroundColor: getPlayerColor(game.name) }}
                            >
                              {getInitials(game.name)}
                            </div>
                            <button
                              onClick={() => setSelectedGame(game)}
                              className="flex-1 text-left min-w-0"
                            >
                              <p className="font-medium text-text-primary truncate">{game.name}</p>
                              <p className="text-xs text-text-muted">{game.platform || game.category}</p>
                            </button>
                            <button
                              onClick={() => handleEditGame(game)}
                              className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg active:bg-background-elevated"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingGame(game)}
                              className="w-10 h-10 flex items-center justify-center text-text-muted active:text-red-500 rounded-lg active:bg-background-elevated"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronRight className="w-5 h-5 text-text-muted" />
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  /* Game Modes View */
                  <>
                    {/* Back + Add mode button */}
                    <div className="px-md py-3 flex gap-2">
                      <button
                        onClick={() => setSelectedGame(null)}
                        className="h-[48px] px-4 flex items-center gap-1 bg-background-elevated text-text-secondary font-medium rounded-lg active:bg-background-primary"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        onClick={handleAddMode}
                        className="flex-1 h-[48px] flex items-center justify-center gap-2 bg-category-party/20 text-category-party font-semibold rounded-lg active:bg-category-party/30 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add Mode to {selectedGame.name}</span>
                      </button>
                    </div>

                    {/* Mode list */}
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
                                {mode.subtitle && `${mode.subtitle} • `}
                                {SCORE_FORMATS.find(f => f.value === mode.score_format)?.label}
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
                  </>
                )}
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
                <div className="px-md py-3">
                  <p className="text-sm text-text-muted">Recent scores — tap to delete</p>
                </div>

                {/* Score list */}
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
                            {score.game_name} • {score.mode_name}
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
      <AnimatePresence>
        {showPlayerForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-md"
            onClick={() => setShowPlayerForm(false)}
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
                  onClick={() => setShowPlayerForm(false)}
                  className="w-8 h-8 flex items-center justify-center text-text-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Player name"
                autoFocus
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-4 outline-none focus:ring-2 focus:ring-category-golf"
              />
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
              <input
                type="text"
                value={modeSubtitle}
                onChange={(e) => setModeSubtitle(e.target.value)}
                placeholder="Subtitle (e.g. Time Trial)"
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
    </KioskLayout>
  )
}