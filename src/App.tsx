import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
  IdleDisplay,
  CategorySelection,
  GameSelection,
  ModeSelection,
  LeaderboardView,
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
        {/* Idle carousel - home screen */}
        <Route path="/" element={<IdleDisplay />} />

        {/* Browse hierarchy */}
        <Route path="/browse" element={<CategorySelection />} />
        <Route path="/browse/:category" element={<GameSelection />} />
        <Route path="/browse/:category/:gameId" element={<ModeSelection />} />
        <Route path="/browse/:category/:gameId/:modeId" element={<LeaderboardView />} />

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