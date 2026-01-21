import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, AlertCircle, CheckCircle, AlertTriangle, FileText, HelpCircle } from 'lucide-react'
import { useBulkImport } from '@/hooks/useBulkImport'

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (count: number) => void
}

/**
 * BulkImportModal - Smart paste box for CSV/JSON score import
 * 
 * Features:
 * - Accepts CSV or JSON format
 * - Auto-detects format
 * - Fuzzy matches player/game/mode names
 * - Shows validation preview
 * - Batch imports valid rows
 */
export function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const [input, setInput] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null)
  
  const {
    rows,
    summary,
    parsing,
    importing,
    error,
    parseInput,
    importRows,
    clearRows,
  } = useBulkImport()

  const handleParse = async () => {
    setImportResult(null)
    await parseInput(input)
  }

  const handleImport = async () => {
    const result = await importRows()
    setImportResult(result)
    if (result.success > 0) {
      onSuccess?.(result.success)
    }
  }

  const handleClose = () => {
    setInput('')
    setImportResult(null)
    clearRows()
    setShowHelp(false)
    onClose()
  }

  const handleClear = () => {
    setInput('')
    setImportResult(null)
    clearRows()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-md overflow-y-auto"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[700px] bg-background-card rounded-xl my-4 overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
          >
            {/* Header */}
            <div className="h-[56px] px-md flex items-center justify-between border-b border-background-elevated">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-category-golf" />
                <h2 className="text-lg font-bold text-text-primary">Bulk Import Scores</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Help Panel */}
            <AnimatePresence>
              {showHelp && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-background-elevated"
                >
                  <div className="p-md bg-background-elevated/50 text-sm space-y-3">
                    <p className="font-medium text-text-primary">Required CSV columns: player, game, mode, score</p>
                    <p className="text-text-secondary">Optional: detail (or track/course)</p>
                    
                    <div className="space-y-2">
                      <p className="font-medium text-text-primary">Score formats by game type:</p>
                      <div className="grid grid-cols-2 gap-2 text-text-secondary">
                        <div>
                          <span className="text-text-muted">Race times (ms):</span> 1:23.456 or 83.456
                        </div>
                        <div>
                          <span className="text-text-muted">Race times (s):</span> 4:56 or 296
                        </div>
                        <div>
                          <span className="text-text-muted">Golf:</span> -6, +2, 0, E
                        </div>
                        <div>
                          <span className="text-text-muted">Points:</span> 1000, 47
                        </div>
                        <div>
                          <span className="text-text-muted">Percentage:</span> 98.45
                        </div>
                        <div>
                          <span className="text-text-muted">Level:</span> 8-4
                        </div>
                      </div>
                    </div>

                    <div className="p-2 bg-background-card rounded-lg font-mono text-xs">
                      player,game,mode,score<br/>
                      Mike,Mario Kart 8,Rainbow Road,1:23.456<br/>
                      Sarah,Mario Golf,Standard,-3<br/>
                      Emma,Darts,501,12
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <div className="p-md space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Import result message */}
              {importResult && (
                <div className={`p-3 rounded-lg flex items-center gap-3 ${
                  importResult.failed === 0 ? 'bg-green-500/20' : 'bg-yellow-500/20'
                }`}>
                  {importResult.failed === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                  <p className="text-text-primary">
                    Imported {importResult.success} score{importResult.success !== 1 ? 's' : ''}
                    {importResult.failed > 0 && ` (${importResult.failed} failed)`}
                  </p>
                </div>
              )}

              {/* Input area */}
              {rows.length === 0 && (
                <>
                  <div>
                    <label className="block text-sm text-text-secondary mb-2">
                      Paste CSV or JSON data
                    </label>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={`player,game,mode,score\nMike,Mario Kart 8,Rainbow Road,1:23.456\nSarah,Mario Golf,Standard,-3`}
                      className="w-full h-[200px] p-md bg-background-elevated text-text-primary rounded-lg font-mono text-sm resize-none outline-none focus:ring-2 focus:ring-category-golf"
                    />
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="p-3 bg-red-500/20 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Parse button */}
                  <button
                    onClick={handleParse}
                    disabled={!input.trim() || parsing}
                    className="w-full h-[56px] bg-category-golf text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    {parsing ? 'Parsing...' : 'Preview Import'}
                  </button>
                </>
              )}

              {/* Preview table */}
              {rows.length > 0 && (
                <>
                  {/* Summary */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-text-secondary">
                      {summary.total} row{summary.total !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1 text-green-500">
                      <CheckCircle className="w-4 h-4" />
                      {summary.valid} valid
                    </span>
                    {summary.invalid > 0 && (
                      <span className="flex items-center gap-1 text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        {summary.invalid} invalid
                      </span>
                    )}
                    {summary.warnings > 0 && (
                      <span className="flex items-center gap-1 text-yellow-500">
                        <AlertTriangle className="w-4 h-4" />
                        {summary.warnings} warnings
                      </span>
                    )}
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto border border-background-elevated rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-background-elevated">
                          <th className="px-3 py-2 text-left text-text-muted font-medium w-8">#</th>
                          <th className="px-3 py-2 text-left text-text-muted font-medium">Player</th>
                          <th className="px-3 py-2 text-left text-text-muted font-medium">Game</th>
                          <th className="px-3 py-2 text-left text-text-muted font-medium">Mode</th>
                          <th className="px-3 py-2 text-left text-text-muted font-medium">Score</th>
                          <th className="px-3 py-2 text-left text-text-muted font-medium w-8">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 50).map((row) => (
                          <tr 
                            key={row.rowNumber} 
                            className={`border-t border-background-elevated ${
                              !row.isValid ? 'bg-red-500/10' : row.warnings.length > 0 ? 'bg-yellow-500/10' : ''
                            }`}
                          >
                            <td className="px-3 py-2 text-text-muted">{row.rowNumber}</td>
                            <td className="px-3 py-2 text-text-primary">{row.player}</td>
                            <td className="px-3 py-2 text-text-primary">{row.game}</td>
                            <td className="px-3 py-2 text-text-primary">{row.mode}</td>
                            <td className="px-3 py-2 text-text-primary font-mono">{row.scoreRaw}</td>
                            <td className="px-3 py-2">
                              {row.isValid ? (
                                row.warnings.length > 0 ? (
                                  <div className="group relative">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-background-card rounded shadow-lg text-xs z-10">
                                      {row.warnings.map((w, i) => (
                                        <p key={i} className="text-yellow-400">{w}</p>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )
                              ) : (
                                <div className="group relative">
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                  <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-background-card rounded shadow-lg text-xs z-10">
                                    {row.errors.map((e, i) => (
                                      <p key={i} className="text-red-400">{e}</p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {rows.length > 50 && (
                      <div className="px-3 py-2 bg-background-elevated text-text-muted text-sm">
                        Showing first 50 of {rows.length} rows
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleClear}
                      disabled={importing}
                      className="flex-1 h-[56px] bg-background-elevated text-text-primary font-semibold rounded-lg disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={importing || summary.valid === 0}
                      className="flex-1 h-[56px] bg-category-golf text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      {importing ? 'Importing...' : `Import ${summary.valid} Score${summary.valid !== 1 ? 's' : ''}`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}