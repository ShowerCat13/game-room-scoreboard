import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import {
  SelectField,
  PickerModal,
  TimeInput,
  NumericInput,
  NewPlayerModal,
  LapTimePad
} from '@/components/input'
import { CelebrationOverlay } from '@/components/overlays'
import { useGames } from '@/hooks/useGames'
import { useGameModes } from '@/hooks/useGameModes'
import { useGameDetails } from '@/hooks/useGameDetails'
import { usePlayers } from '@/hooks/usePlayers'
import { useSubmitScore } from '@/hooks/useSubmitScore'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { bestPerPlayer } from '@/hooks/useBestTimesLeaderboard'
import type { ScoreFormat, ScoreDirection } from '@/lib/types'
import { formatScore } from '@/lib/utils'

type PickerType = 'game' | 'mode' | 'detail' | 'player' | null

/**
 * AddScore - Multi-step score entry form
 * Route: /add-score
 *
 * Supports URL params for pre-population:
 * - ?gameId=xxx - Pre-select a game
 * - ?modeId=xxx - Pre-select a mode (requires gameId)
 * - ?detailId=xxx - Pre-select a detail (requires gameId + modeId)
 * - ?locked=1 - Hide game/mode/detail pickers and rank by best time per player
 *   (used by the Halloween party screen and its QR code)
 */
export function AddScore() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isLocked = searchParams.get('locked') === '1'

  // Form state - pre-populate from URL params if present
  const [selectedGameId, setSelectedGameId] = useState<string | null>(
    searchParams.get('gameId')
  )
  const [selectedModeId, setSelectedModeId] = useState<string | null>(
    searchParams.get('modeId')
  )
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(
    searchParams.get('detailId')
  )
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [scoreValue, setScoreValue] = useState<number | null>(null)
  const [timeHint, setTimeHint] = useState<string | null>(null)

  // Modal visibility state
  const [activePicker, setActivePicker] = useState<PickerType>(null)
  const [showNewPlayerModal, setShowNewPlayerModal] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [submittedRank, setSubmittedRank] = useState(1)
  const [celebrationNote, setCelebrationNote] = useState<string | null>(null)

  // Data hooks
  const { games, loading: gamesLoading } = useGames()
  const { modes, loading: modesLoading } = useGameModes(selectedGameId)
  const { details, loading: detailsLoading } = useGameDetails(selectedGameId, selectedModeId)
  const { players, loading: playersLoading, createPlayer } = usePlayers()
  const { submitScore, submitting, error: submitError } = useSubmitScore()

  // Fetch current leaderboard to calculate rank
  const { entries: currentLeaderboard } = useLeaderboard(
    selectedGameId,
    selectedModeId,
    selectedDetailId,
    isLocked ? 1000 : 100
  )

  // Derived display values
  const selectedGame = useMemo(
    () => games.find((g) => g.id === selectedGameId) || null,
    [games, selectedGameId]
  )

  const selectedMode = useMemo(
    () => modes.find((m) => m.id === selectedModeId) || null,
    [modes, selectedModeId]
  )

  const selectedDetail = useMemo(
    () => details.find((d) => d.id === selectedDetailId) || null,
    [details, selectedDetailId]
  )

  const selectedPlayer = useMemo(
    () => players.find((p) => p.id === selectedPlayerId) || null,
    [players, selectedPlayerId]
  )

  // Does this game use details?
  const gameHasDetails = selectedGame?.has_details ?? false
  
  // Does this game use modes?
  const gameHasModes = selectedGame?.has_modes ?? true

  // Get effective score format/direction (detail → mode → game defaults)
  const effectiveScoreFormat: ScoreFormat = useMemo(() => {
    if (selectedDetail?.score_format) return selectedDetail.score_format
    if (selectedMode?.score_format) return selectedMode.score_format
    if (selectedGame?.default_score_format) return selectedGame.default_score_format
    return 'integer'
  }, [selectedDetail, selectedMode, selectedGame])

  const effectiveScoreDirection: ScoreDirection = useMemo(() => {
    if (selectedDetail?.score_direction) return selectedDetail.score_direction
    if (selectedMode?.score_direction) return selectedMode.score_direction
    if (selectedGame?.default_score_direction) return selectedGame.default_score_direction
    return 'higher_better'
  }, [selectedDetail, selectedMode, selectedGame])

  const effectiveScoreUnit: string | null = useMemo(() => {
    if (selectedDetail?.score_unit) return selectedDetail.score_unit
    if (selectedMode?.score_unit) return selectedMode.score_unit
    if (selectedGame?.default_score_unit) return selectedGame.default_score_unit
    return null
  }, [selectedDetail, selectedMode, selectedGame])

  // Clear dependent fields when game changes
  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId)
    setSelectedModeId(null)
    setSelectedDetailId(null)
    setScoreValue(null)
  }

  // Clear detail and score when mode changes
  const handleModeSelect = (modeId: string) => {
    setSelectedModeId(modeId)
    setSelectedDetailId(null)
    setScoreValue(null)
  }

  // Clear score when detail changes (format may differ)
  const handleDetailSelect = (detailId: string) => {
    setSelectedDetailId(detailId)
    setScoreValue(null)
  }

  // Create new player and auto-select them
  const handleCreatePlayer = async (name: string, avatarUrl?: string | null) => {
    // Reuse an existing player with the same name rather than creating a duplicate
    const existing = players.find((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase())
    if (existing) {
      setSelectedPlayerId(existing.id)
      return
    }

    const player = await createPlayer(name, avatarUrl)
    if (player) {
      setSelectedPlayerId(player.id)
    }
  }

  // Calculate what rank this score would achieve
  const calculateRank = (score: number): number => {
    if (currentLeaderboard.length === 0) return 1

    const isLowerBetter = effectiveScoreDirection === 'lower_better'

    // Locked (party) mode: one entry per player, so rank the player's best
    // time against everyone else's best
    if (isLocked) {
      const board = bestPerPlayer(currentLeaderboard)
      const previousBest = board.find((e) => e.player_id === selectedPlayerId)?.score
      const best = previousBest === undefined
        ? score
        : isLowerBetter ? Math.min(score, previousBest) : Math.max(score, previousBest)

      return 1 + board.filter((e) =>
        e.player_id !== selectedPlayerId &&
        (isLowerBetter ? e.score <= best : e.score >= best)
      ).length
    }

    let rank = 1

    for (const entry of currentLeaderboard) {
      if (isLowerBetter) {
        if (score >= entry.score) rank++
      } else {
        if (score <= entry.score) rank++
      }
    }

    return rank
  }

  // Form validation - detail is optional based on game config
  const isFormComplete = Boolean(
    selectedGameId &&
    (!gameHasModes || selectedModeId) &&
    (!gameHasDetails || selectedDetailId) &&
    selectedPlayerId &&
    scoreValue !== null
  )
  const canSubmit = isFormComplete && !submitting

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedGameId || !selectedPlayerId || scoreValue === null) return

    const result = await submitScore({
      gameId: selectedGameId,
      modeId: selectedModeId,
      detailId: selectedDetailId,
      playerId: selectedPlayerId,
      score: scoreValue,
    })

    if (result.success) {
      const rank = calculateRank(scoreValue)
      setSubmittedRank(rank)

      // Party mode: tell returning racers whether they beat their own best
      if (isLocked) {
        const isLowerBetter = effectiveScoreDirection === 'lower_better'
        const previousBest = bestPerPlayer(currentLeaderboard)
          .find((e) => e.player_id === selectedPlayerId)?.score
        const improved = previousBest === undefined ||
          (isLowerBetter ? scoreValue < previousBest : scoreValue > previousBest)
        setCelebrationNote(
          previousBest === undefined ? null
            : improved ? 'New personal best!'
            : `Your best is still ${formatScore(previousBest, effectiveScoreFormat, effectiveScoreUnit)}`
        )
      }

      setShowCelebration(true)
    }
  }

  // Handle celebration dismiss - return to home
  const handleCelebrationClose = () => {
    setShowCelebration(false)
    navigate('/')
  }

  // Handle back/cancel
  const handleBack = () => {
    if (isLocked) {
      navigate('/')
    } else if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  // Render appropriate score input based on effective score format
  const renderScoreInput = () => {
    // Need mode selected (or game without modes) before showing score input
    const readyForScore = gameHasModes ? selectedModeId : selectedGameId
    
    if (!readyForScore) {
      return (
        <div className="h-[64px] flex items-center justify-center">
          <p className="text-text-muted">
            Select a {gameHasModes ? selectedGame?.mode_label?.toLowerCase() || 'mode' : 'game'} first
          </p>
        </div>
      )
    }

    switch (effectiveScoreFormat) {
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
            unit={effectiveScoreUnit}
            isDecimal={true}
          />
        )

      case 'golf_relative':
        return (
          <NumericInput
            value={scoreValue}
            onChange={setScoreValue}
            unit={effectiveScoreUnit}
            isDecimal={false}
            allowNegative={true}
          />
        )

      case 'integer':
      case 'level':
      default:
        return (
          <NumericInput
            value={scoreValue}
            onChange={setScoreValue}
            unit={effectiveScoreUnit}
            isDecimal={false}
          />
        )
    }
  }

  // Get input label based on score format
  const getScoreInputLabel = (): string => {
    if (effectiveScoreFormat === 'time_ms' || effectiveScoreFormat === 'time_seconds') {
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
    })),
    [modes]
  )

  const detailOptions = useMemo(() =>
    details.map((d) => ({
      id: d.id,
      label: d.name,
    })),
    [details]
  )

  const playerOptions = useMemo(() =>
    players.map((p) => ({
      id: p.id,
      label: p.name
    })),
    [players]
  )

  // Get labels from game config
  const modeLabel = selectedGame?.mode_label || 'Mode'
  const detailLabel = selectedGame?.detail_label || 'Track'

  // Shared modals (pickers, new player, celebration)
  const modals = (
    <>
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
        title={`Select ${modeLabel}`}
        options={modeOptions}
        selectedId={selectedModeId}
        onSelect={handleModeSelect}
        emptyMessage={selectedGameId ? `No ${modeLabel.toLowerCase()}s for this game` : 'Select a game first'}
      />

      {/* Detail picker modal */}
      <PickerModal
        isOpen={activePicker === 'detail'}
        onClose={() => setActivePicker(null)}
        title={`Select ${detailLabel}`}
        options={detailOptions}
        selectedId={selectedDetailId}
        onSelect={handleDetailSelect}
        emptyMessage={
          selectedModeId || !gameHasModes
            ? `No ${detailLabel.toLowerCase()}s available`
            : `Select ${modeLabel.toLowerCase()} first`
        }
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
        showSpookicons={isLocked}
      />

      {/* Celebration overlay */}
      {selectedPlayer && scoreValue !== null && (
        <CelebrationOverlay
          isOpen={showCelebration}
          onClose={handleCelebrationClose}
          playerName={selectedPlayer.name}
          score={scoreValue}
          scoreFormat={effectiveScoreFormat}
          scoreUnit={effectiveScoreUnit}
          rank={submittedRank}
          note={celebrationNote}
        />
      )}
    </>
  )

  // Party (locked) layout: name + save on the left, time keypad on the right
  if (isLocked) {
    return (
      <KioskLayout>
        <div className="h-full flex flex-col">
          <BrowseHeader backLabel="Cancel" onBack={handleBack} title="ADD YOUR TIME" />

          <div className="flex-1 min-h-0 flex gap-md p-md mobile:flex-col">
            {/* On phones this column dissolves (mobile:contents) so the keypad can sit above Save */}
            <div className="flex-1 min-w-0 flex flex-col gap-3 mobile:contents">
              <div className="card px-md py-3 text-center">
                <p className="text-lg font-bold text-text-primary">
                  {selectedDetail?.name || 'Loading track...'}
                </p>
                <p className="text-sm text-text-secondary">
                  {[selectedGame?.name, selectedMode?.name].filter(Boolean).join(' · ')}
                </p>
              </div>

              <SelectField
                label="Who's racing?"
                value={selectedPlayer?.name || null}
                placeholder={playersLoading ? 'Loading...' : 'Tap to pick or add your name'}
                onPress={() => setActivePicker('player')}
                disabled={playersLoading}
              />

              <p className={`mobile:order-4 text-sm text-center min-h-[20px] ${timeHint ? 'text-red-400 font-semibold' : 'text-text-muted'}`}>
                {timeHint ?? (selectedPlayer && scoreValue === null ? 'Enter your time on the keypad' : '')}
              </p>

              {submitError && (
                <p className="mobile:order-4 text-red-500 text-center text-sm">{submitError.message}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`
                  mt-auto w-full h-[56px] rounded-lg text-lg font-bold transition-colors mobile:order-5
                  ${canSubmit ? 'party-cta active:brightness-110' : 'bg-background-elevated text-text-muted cursor-not-allowed'}
                `}
              >
                {submitting ? 'Saving...' : 'Save Time'}
              </button>
            </div>

            <div className="w-[280px] flex-shrink-0 mobile:w-full mobile:order-3">
              <LapTimePad onChange={setScoreValue} onValidityChange={setTimeHint} />
            </div>
          </div>
        </div>
        {modals}
      </KioskLayout>
    )
  }

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

          {/* Mode selector - shown if game has modes */}
          {gameHasModes && (
            <SelectField
              label={modeLabel}
              value={selectedMode?.name || null}
              placeholder={
                !selectedGameId
                  ? 'Select a game first'
                  : modesLoading
                    ? 'Loading...'
                    : `Select ${modeLabel.toLowerCase()}`
              }
              onPress={() => setActivePicker('mode')}
              disabled={!selectedGameId || modesLoading}
            />
          )}

          {/* Detail selector - shown if game has details */}
          {gameHasDetails && (
            <SelectField
              label={detailLabel}
              value={selectedDetail?.name || null}
              placeholder={
                !selectedModeId && gameHasModes
                  ? `Select ${modeLabel.toLowerCase()} first`
                  : !selectedGameId
                    ? 'Select a game first'
                    : detailsLoading
                      ? 'Loading...'
                      : `Select ${detailLabel.toLowerCase()}`
              }
              onPress={() => setActivePicker('detail')}
              disabled={(!selectedModeId && gameHasModes) || !selectedGameId || detailsLoading}
            />
          )}

          {/* Player selector */}
          <SelectField
            label="Player"
            value={selectedPlayer?.name || null}
            placeholder={playersLoading ? 'Loading...' : 'Select a player'}
            onPress={() => setActivePicker('player')}
            disabled={playersLoading}
          />

          {/* Score input */}
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

        {/* Submit button */}
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

      {modals}
    </KioskLayout>
  )
}