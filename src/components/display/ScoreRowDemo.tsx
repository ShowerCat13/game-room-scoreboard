import { ScoreRow } from './ScoreRow'

/**
 * ScoreRowDemo - Demonstrates the ScoreRow component with sample data
 * Used for testing and development
 */
export function ScoreRowDemo() {
  return (
    <div className="space-y-2 p-4 bg-background-card rounded-lg">
      <h2 className="text-lg font-bold text-text-primary mb-4">
        Score Row Component Demo
      </h2>

      {/* Time format (race times) */}
      <div className="space-y-2">
        <h3 className="text-sm text-text-secondary">Time Format (ms)</h3>
        <ScoreRow
          rank={1}
          playerName="Alice Johnson"
          score={142567}
          scoreFormat="time_ms"
          className="bg-background-primary rounded"
        />
        <ScoreRow
          rank={2}
          playerName="Bob Smith"
          score={144891}
          scoreFormat="time_ms"
          className="bg-background-primary rounded"
        />
        <ScoreRow
          rank={3}
          playerName="Charlie Brown"
          score={151044}
          scoreFormat="time_ms"
          className="bg-background-primary rounded"
        />
        <ScoreRow
          rank={4}
          playerName="Diana Prince"
          score={155220}
          scoreFormat="time_ms"
          className="bg-background-primary rounded"
        />
      </div>

      {/* Integer format (points, throws, etc.) */}
      <div className="space-y-2 mt-6">
        <h3 className="text-sm text-text-secondary">Integer Format</h3>
        <ScoreRow
          rank={1}
          playerName="Emma Wilson"
          score={15}
          scoreFormat="integer"
          scoreUnit="darts"
          className="bg-background-primary rounded"
        />
        <ScoreRow
          rank={2}
          playerName="Frank Miller"
          score={18}
          scoreFormat="integer"
          scoreUnit="darts"
          className="bg-background-primary rounded"
        />
        <ScoreRow
          rank={3}
          playerName="Grace Lee"
          score={21}
          scoreFormat="integer"
          scoreUnit="darts"
          className="bg-background-primary rounded"
        />
      </div>

      {/* Decimal format (percentages) */}
      <div className="space-y-2 mt-6">
        <h3 className="text-sm text-text-secondary">Decimal Format</h3>
        <ScoreRow
          rank={1}
          playerName="Henry Taylor"
          score={9845}
          scoreFormat="decimal_2"
          scoreUnit="%"
          className="bg-background-primary rounded"
        />
        <ScoreRow
          rank={2}
          playerName="Iris Chen"
          score={9567}
          scoreFormat="decimal_2"
          scoreUnit="%"
          className="bg-background-primary rounded"
        />
      </div>
    </div>
  )
}
