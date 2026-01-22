# Game Room Scoreboard

A touch-friendly high score tracker for your home game room. Built for Raspberry Pi kiosks, accessible from any device.

![Version](https://img.shields.io/badge/version-0.9.9-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tests](https://img.shields.io/badge/tests-119%20passing-brightgreen)

<!-- TODO: Add screenshots
![Idle Display](docs/images/idle-display.png)
![Mobile View](docs/images/mobile-view.png)
-->

## Features

- **Kiosk Display** — Auto-cycling leaderboards on a 7" touchscreen
- **Mobile Access** — Add scores from your phone via QR code
- **Multi-Format Scoring** — Times (1:58.234), golf (-3, E, +2), points, percentages
- **Real-time Sync** — Scores update instantly across all devices
- **Celebrations** — Confetti and sound effects for new high scores
- **6 Themes** — Dark, Light, OLED, Cyberpunk, Retro, Nature
- **Bulk Import** — Paste CSV/JSON to import historical scores
- **PIN Protection** — Optional admin PIN for destructive actions

## Supported Games

Works with any game that has trackable scores:

- **Racing** — Mario Kart lap times, F1, iRacing, Assetto Corsa
- **Golf** — Mario Golf, PGA 2K, with relative-to-par scoring
- **Darts** — 301, 501, Cricket
- **Arcade** — Pinball, classic games
- **Party Games** — Mario Party, Jackbox
- **RPGs** — Kill counts, completion percentage, speedruns

## Quick Start

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) account (free tier works)
- (Optional) Raspberry Pi 4 + 7" touchscreen

### Installation

```bash
git clone https://github.com/yourusername/game-room-scoreboard.git
cd game-room-scoreboard
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `schema.sql`
3. (Optional) Run `seed.sql` for sample data
4. Create an `avatars` bucket in Storage (set to public)
5. Copy your project URL and anon key to `.env.local`

## Usage

### Kiosk

The idle display shows auto-cycling leaderboards. Tap to interact:

| Button | Action |
|--------|--------|
| **Browse** | Explore leaderboards by category |
| **+Add** | Add score, add player, or manage data |
| **Settings** | Themes, sound, display options |

### Mobile

1. Scan the QR code on the kiosk display
2. Or visit `http://scoreboard.local:4173`
3. Add scores from the couch

## Themes

| Theme | Description |
|-------|-------------|
| Dark | Classic dark mode (default) |
| Light | Clean and bright |
| OLED | Pure black for OLED screens |
| Cyberpunk | Neon cyan and magenta |
| Retro | Warm amber arcade vibes |
| Nature | Forest greens |

## Raspberry Pi Deployment

```bash
npm run build
npm install -g serve pm2
pm2 start "serve -s dist -l 4173" --name scoreboard
pm2 save && pm2 startup
```

For kiosk auto-start, create `~/.config/autostart/scoreboard.desktop`:

```ini
[Desktop Entry]
Type=Application
Name=Scoreboard
Exec=chromium-browser --kiosk --noerrdialogs http://localhost:4173
```

## Documentation

| Document | Description |
|----------|-------------|
| [User Guide](USER_GUIDE.md) | How to use all features |
| [Developer Guide](DEVELOPER_GUIDE.md) | Architecture and contributing |
| [Changelog](CHANGELOG.md) | Version history |
| [Future Enhancements](FUTURE_ENHANCEMENTS.md) | Roadmap |

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State:** Zustand
- **Backend:** Supabase (PostgreSQL + Realtime + Storage)
- **Testing:** Playwright

## Known Limitations

- Requires network connection (no offline mode)
- Single household (no multi-tenant support)
- English only
- PIN is a simple deterrent, not cryptographic security

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with [Supabase](https://supabase.com), [Tailwind CSS](https://tailwindcss.com), [Framer Motion](https://framer.com/motion), and [Lucide Icons](https://lucide.dev).