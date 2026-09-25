import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import {
  PartyDisplay,
  AddScore,
  Settings,
  Manage,
} from '@/pages'
import { useSoundInit, useTheme } from '@/hooks'

function App() {
  // Initialize audio context on first user interaction
  useSoundInit()
  
  // Apply theme CSS variables to document root
  useTheme()

  return (
    <BrowserRouter>
      <Routes>
        {/* Halloween 2026: single Boo Cinema leaderboard replaces the carousel */}
        <Route path="/" element={<PartyDisplay />} />

        {/* Browse hierarchy is hidden for the party */}
        <Route path="/browse/*" element={<Navigate to="/" replace />} />

        {/* Score entry */}
        <Route path="/add-score" element={<AddScore />} />

        {/* Settings & Management */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/manage" element={<Manage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
