# Changelog

All notable changes to Game Room Scoreboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.9.9] - 2025-01-21

### Fixed
- **QR Code IP Detection** - QR code now uses dynamic IP detection via Vite config instead of static mDNS URL. Works on any local network without mDNS setup.
- **Mobile IdleDisplay Layout** - Header now uses `idle-header` CSS class for proper responsive behavior on mobile devices
- **Production Cleanup** - Removed console.log statement from IdleDisplay

### Changed
- `vite.config.ts` now detects local IP at startup and injects it as `__LOCAL_IP__` constant
- IdleDisplay uses `getQrUrl()` function for QR code URL generation
- Documentation audit complete - all docs updated and unicode issues fixed

### Technical Details
The QR code fix required:
1. `vite.config.ts` - Added `os.networkInterfaces()` IP detection with `define: { __LOCAL_IP__ }`
2. `IdleDisplay.tsx` - Replaced static `SCOREBOARD_URL` with dynamic `getQrUrl()` using injected IP

---

## [0.9.8] - 2025-01-21

### Added
- **Mario Party Jamboree** - 4 minigames (Three Throw, Sled to the Edge, Fuzzy Heights, Domination)
- **Regression test suite** - `regression-beta-fixes.spec.ts` with 15 tests
- **119 total E2E tests** (up from 104)

### Fixed
- **BETA-001:** Clock size increased to 48px for readability from across room
- **BETA-002:** Idle screen now refreshes when realtime score events arrive
- **BETA-005:** Idle carousel correctly groups by detail for games with `has_details=true`
- **BETA-006:** Back button race condition fixed - uses `navigate(-1)` instead of async data
- Navigation tests updated to match actual UI (header shows "CATEGORIES", contextual back labels)

### Changed
- `useCarouselItems` hook replaces `useActiveGameModes` for idle carousel
- `RealtimeScoreAlert` accepts optional `detailName` prop

### Closed (User Accepted)
- **ALPHA-003:** CRUD discoverability - Settings -> Manage is acceptable
- **ALPHA-009:** Avatar upload discoverability - current UX is acceptable

---

## [0.9.7] - 2025-01-20

### Added

#### ALPHA-013: E2E Testing with Playwright
- **104 passing tests** covering all major functionality
- Test suites for navigation, settings, score submission, CRUD, realtime, management, accessibility
- Playwright configuration for 800x480 kiosk viewport

#### ALPHA-012: Theme System
- 6 theme presets: Dark, Light, OLED, Cyberpunk, Retro, Nature
- Text color override (auto/light/dark)
- Persistent via localStorage

#### ALPHA-011: QR Code & mDNS
- QR code popup on idle display
- mDNS support - `http://scoreboard.local:4173`

#### ALPHA-010: Clock Display
- 12-hour clock on idle screen header

#### ALPHA-005: Lucide React Icons
- Replaced all emoji icons for cross-platform compatibility

### Changed
- Light theme contrast improvements
- Settings page reorganization

---

## [0.9.5] - 2025-01-18

### Breaking Changes
- Database schema restructured for 3-level hierarchy (Game -> Mode -> Detail)

### Added
- 3-Level Hierarchy support
- Golf relative scoring (+3, E, -2)
- Comprehensive seed data

---

## [0.9.0] - Alpha Release

### Added
- Initial implementation with all core features

---

## Version History

| Version | Date | Status |
|---------|------|--------|
| 0.9.9 | 2025-01-21 | Current - QR fix, mobile fix, docs audit |
| 0.9.8 | 2025-01-21 | Beta bug fixes |
| 0.9.7 | 2025-01-20 | Theme system, E2E tests |
| 0.9.5 | 2025-01-18 | Schema migration |
| 0.9.0 | 2025-01 | Alpha |