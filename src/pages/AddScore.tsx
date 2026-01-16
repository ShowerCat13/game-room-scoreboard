import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import {
  SelectField,
  PickerModal,
  TimeInput,
  NumericInput,
  NewPlayerModal
} from '@/components/input'
import { CelebrationOverlay } from '@/components/overlays'
import { useGames } from '@/hooks/useGames'
import { useGameModes } from '@/hooks/useGameModes'
import { usePlayers } from '@/hooks/usePlayers'
import { useSubmitScore } from '@/hooks/useSubmitScore'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import type { ScoreFormat } from '@/lib/types'

type PickerType = 'game' | 'mode' | 'player' | null

/**
 * AddScore - Multi-step score entry form
 * Route: /add-score
 *
 * Supports URL params for pre-population:
 * - ?gameId=xxx - Pre-select a game
 * - ?modeId=xxx - Pre-select a mode (requires gameId)
 */
export function AddScore() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Form state - pre-populate from URL params if present
  const [selectedGameId, setSelectedGameId] = useState<string | null>(
    searchParams.get('gameId')
  )
  const [selectedModeId, setSelectedModeId] = useState<string | null>(
    searchParams.get('modeId')
  )
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [scoreValue, setScoreValue] = useState<number | null>(null)

  // Modal visibility state
  const [activePicker, setActivePicker] = useState<PickerType>(null)
  const [showNewPlayerModal, setShowNewPlayerModal] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [submittedRank, setSubmittedRank] = useState(1)

  // Data hooks
  const { games, loading: gamesLoading } = useGames()
  const { modes, loading: modesLoading } = useGameModes(selectedGameId)
  const { players, loading: playersLoading, createPlayer } = usePlayers()
  const { submitScore, submitting, error: submitError } = useSubmitScore()

  // Fetch current leaderboard to calculate rank (fetch more to get accurate rank)
  const { data: currentLeaderboard } = useLeaderboard(selectedModeId, 100)

  // Derived display values
  const selectedGame = useMemo(
    () => games.find((g) => g.id === selectedGameId) || null,
    [games, selectedGameId]
  )

  const selectedMode = useMemo(
    () => modes.find((m) => m.id === selectedModeId) || null,
    [modes, selectedModeId]
  )

  const selectedPlayer = useMemo(
    () => players.find((p) => p.id === selectedPlayerId) || null,
    [players, selectedPlayerId]
  )

  // Clear dependent fields when game changes
  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId)
    setSelectedModeId(null) // Clear mode since it depends on game
    setScoreValue(null) // Clear score since input type may change
  }

  // Clear score when mode changes (input type may differ)
  const handleModeSelect = (modeId: string) => {
    setSelectedModeId(modeId)
    setScoreValue(null)
  }

  // Create new player and auto-select them
  const handleCreatePlayer = async (name: string) => {
    const player = await createPlayer(name)
    if (player) {
      setSelectedPlayerId(player.id)
    }
  }

  // Calculate what rank this score would achieve
  const calculateRank = (score: number): number => {
    if (!selectedMode || currentLeaderboard.length === 0) return 1

    const isLowerBetter = selectedMode.score_direction === 'lower_better'
    let rank = 1

    for (const entry of currentLeaderboard) {
      if (isLowerBetter) {
        // For lower_better: if new score is >= existing, it ranks below
        if (score >= entry.score) rank++
      } else {
        // For higher_better: if new score is <= existing, it ranks below
        if (score <= entry.score) rank++
      }
    }

    return rank
  }

  // Form validation
  const isFormComplete = Boolean(
    selectedGameId &&
    selectedModeId &&
    selectedPlayerId &&
    scoreValue !== null
  )
  const canSubmit = isFormComplete && !submitting

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedModeId || !selectedPlayerId || scoreValue === null) return

    const result = await submitScore({
      gameModeId: selectedModeId,
      playerId: selectedPlayerId,
      score: scoreValue,
    })

    if (result.success) {
      // Calculate rank before showing celebration
      const rank = calculateRank(scoreValue)
      setSubmittedRank(rank)
      setShowCelebration(true)
    }
  }

  // Handle celebration dismiss - return to home
  const handleCelebrationClose = () => {
    setShowCelebration(false)
    navigate('/')
  }

  // Handle back/cancel - go back or to home
  const handleBack = () => {
    // If there's history, go back; otherwise go home
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  // Render appropriate score input based on mode's score_format
  const renderScoreInput = () => {
    if (!selectedMode) {
      return (
        <div className="h-[64px] flex items-center justify-center">
          <p className="text-text-muted">Select a game mode first</p>
        </div>
      )
    }

    const format = selectedMode.score_format as ScoreFormat

    switch (format) {
      case 'time_ms':
        return (
          <TimeInput
            value={scoreValue}
            onChange={setScoreValue}
            showMilliseconds={true}
          />
        )

      case 'time_seconds':
        return (
          <TimeInput
            value={scoreValue}
            onChange={setScoreValue}
            showMilliseconds={false}
          />
        )

      case 'decimal_2':
        return (
          <NumericInput
            value={scoreValue}
            onChange={setScoreValue}
            unit={selectedMode.score_unit}
            isDecimal={true}
          />
        )

      case 'integer':
      default:
        return (
          <NumericInput
            value={scoreValue}
            onChange={setScoreValue}
            unit={selectedMode.score_unit}
            isDecimal={false}
          />
        )
    }
  }

  // Get input label based on score format
  const getScoreInputLabel = (): string => {
    if (!selectedMode) return 'Score'

    const format = selectedMode.score_format as ScoreFormat
    if (format === 'time_ms' || format === 'time_seconds') {
      return 'Enter time'
    }
    return 'Enter score'
  }

  // Transform data for picker modals
  const gameOptions = useMemo(() =>
    games.map((g) => ({
      id: g.id,
      label: g.name,
      sublabel: g.platform
    })),
    [games]
  )

  const modeOptions = useMemo(() =>
    modes.map((m) => ({
      id: m.id,
      label: m.name,
      sublabel: m.subtitle
    })),
    [modes]
  )

  const playerOptions = useMemo(() =>
    players.map((p) => ({
      id: p.id,
      label: p.name
    })),
    [players]
  )

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <BrowseHeader
          backLabel="Cancel"
          onBack={handleBack}
          title="ADD SCORE"
        />

        {/* Form body */}
        <div className="flex-1 p-md space-y-4 overflow-y-auto">
          {/* Game selector */}
          <SelectField
            label="Game"
            value={selectedGame?.name || null}
            placeholder={gamesLoading ? 'Loading...' : 'Select a game'}
            onPress={() => setActivePicker('game')}
            disabled={gamesLoading}
          />

          {/* Mode selector - disabled until game is selected */}
          <SelectField
            label="Mode"
            value={selectedMode?.name || null}
            placeholder={
              !selectedGameId
                ? 'Select a game first'
                : modesLoading
                  ? 'Loading...'
                  : 'Select a mode'
            }
            onPress={() => setActivePicker('mode')}
            disabled={!selectedGameId || modesLoading}
          />

          {/* Player selector */}
          <SelectField
            label="Player"
            value={selectedPlayer?.name || null}
            placeholder={playersLoading ? 'Loading...' : 'Select a player'}
            onPress={() => setActivePicker('player')}
            disabled={playersLoading}
          />

          {/* Score input - type varies by mode */}
          <div className="pt-4">
            <p className="text-sm text-text-secondary mb-3 text-center">
              {getScoreInputLabel()}
            </p>
            {renderScoreInput()}
          </div>

          {/* Error display */}
          {submitError && (
            <div className="p-3 bg-red-500/10 rounded-lg">
              <p className="text-red-500 text-center text-sm">
                {submitError.message}
              </p>
            </div>
          )}
        </div>

        {/* Submit button - fixed at bottom */}
        <div className="p-md border-t border-background-elevated">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`
              w-full h-[56px] rounded-lg
              text-lg font-bold
              transition-colors
              ${canSubmit
                ? 'bg-category-darts text-white active:brightness-110'
                : 'bg-background-elevated text-text-muted cursor-not-allowed'
              }
            `}
          >
            {submitting ? 'Saving...' : 'Save Score'}
          </button>
        </div>
      </div>

      {/* ===== MODALS ===== */}

      {/* Game picker modal */}
      <PickerModal
        isOpen={activePicker === 'game'}
        onClose={() => setActivePicker(null)}
        title="Select Game"
        options={gameOptions}
        selectedId={selectedGameId}
        onSelect={handleGameSelect}
        emptyMessage="No games available"
      />

      {/* Mode picker modal */}
      <PickerModal
        isOpen={activePicker === 'mode'}
        onClose={() => setActivePicker(null)}
        title="Select Mode"
        options={modeOptions}
        selectedId={selectedModeId}
        onSelect={handleModeSelect}
        emptyMessage={selectedGameId ? 'No modes for this game' : 'Select a game first'}
      />

      {/* Player picker modal */}
      <PickerModal
        isOpen={activePicker === 'player'}
        onClose={() => setActivePicker(null)}
        title="Select Player"
        options={playerOptions}
        selectedId={selectedPlayerId}
        onSelect={setSelectedPlayerId}
        emptyMessage="No players yet — create one!"
        footerAction={{
          label: '+ New Player',
          onPress: () => {
            setActivePicker(null)
            setShowNewPlayerModal(true)
          },
        }}
      />

      {/* New player creation modal */}
      <NewPlayerModal
        isOpen={showNewPlayerModal}
        onClose={() => setShowNewPlayerModal(false)}
        onCreate={handleCreatePlayer}
      />

      {/* Celebration overlay - shown after successful submission */}
      {selectedPlayer && selectedMode && scoreValue !== null && (
        <CelebrationOverlay
          isOpen={showCelebration}
          onClose={handleCelebrationClose}
          playerName={selectedPlayer.name}
          score={scoreValue}
          scoreFormat={selectedMode.score_format as ScoreFormat}
          scoreUnit={selectedMode.score_unit}
          rank={submittedRank}
        />
      )}
    </KioskLayout>
  )
}
