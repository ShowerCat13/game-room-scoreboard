// src/hooks/index.ts
// Custom React hooks
// Export hooks from this directory for easy imports

export { useGame } from './useGame'
export { useGames } from './useGames'
export { useGameMode } from './useGameMode'
export { useGameModes } from './useGameModes'
export { useGameDetails } from './useGameDetails'
export { useLeaderboard } from './useLeaderboard'
export { usePlayers } from './usePlayers'
export { useRealtimeScores } from './useRealtimeScores'
export { useSubmitScore } from './useSubmitScore'
export { useIdleTimer } from './useIdleTimer'
export { useCarouselItems } from './useCarouselItems'
export type { CarouselItem } from './useCarouselItems'
export { useSoundInit } from './useSoundInit'
export { useScoreDetails } from './useScoreDetails'
export { useTheme } from './useTheme'
export type { RealtimeScoreData } from './useScoreDetails'

// Management hooks
export { useManagePlayers } from './useManagePlayers'
export { useManageGames } from './useManageGames'
export { useManageGameModes } from './useManageGameModes'
export { useManageGameDetails } from './useManageGameDetails'
export { useManageScores } from './useManageScores'
export type { ScoreWithDetails } from './useManageScores'

// Halloween 2026 party
export { useBestTimesLeaderboard, fetchBestTimes, bestPerPlayer } from './useBestTimesLeaderboard'
export { useHauntNet } from './useHauntNet'
