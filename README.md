# 🏆 Game Room Scoreboard

A beautiful, touch-friendly high score tracker for your home game room. Built for Raspberry Pi kiosks, accessible from any device.

![Version](https://img.shields.io/badge/version-1.0.0--beta-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tests](https://img.shields.io/badge/tests-104%20passing-brightgreen)

<p align="center">
  <img src="docs/images/idle-display.png" alt="Idle Display" width="400">
  <img src="docs/images/mobile-view.png" alt="Mobile View" width="200">
</p>

---

## ✨ Features

- **🖥️ Kiosk Display** — Auto-cycling leaderboards on a 7" touchscreen
- **📱 Mobile Access** — Add scores from your phone via QR code
- **🎮 Any Game** — Racing, golf, darts, pinball, RPGs, and more
- **⚡ Real-time** — Scores sync instantly across all devices
- **🎉 Celebrations** — Confetti and sound effects for new high scores
- **🎨 Themes** — 6 beautiful presets (Dark, Light, OLED, Cyberpunk, Retro, Nature)
- **📊 Bulk Import** — Paste CSV/JSON to import historical scores
- **🔒 PIN Protection** — Optional admin PIN for destructive actions

---

## 🎯 Perfect For

- 🏎️ **Racing** — Mario Kart lap times, F1, iRacing, Assetto Corsa
- ⛳ **Golf** — Mario Golf, PGA, with relative-to-par scoring
- 🎯 **Darts** — 301, 501, Cricket
- 🕹️ **Arcade** — Pinball, classic games
- 🎲 **Party Games** — Mario Party minigames, Jackbox
- ⚔️ **RPGs** — Kill counts, completion percentage

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) account (free tier works)
- (Optional) Raspberry Pi 4 + 7" touchscreen

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/game-room-scoreboard.git
cd game-room-scoreboard

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `schema.sql`
3. (Optional) Run `seed.sql` for sample data
4. Create an `avatars` bucket in Storage (set to public)
5. Copy your project URL and anon key to `.env.local`

---

## 📱 Usage

### On the Kiosk

The idle display shows auto-cycling leaderboards. Tap to interact:

| Button | Action |
|--------|--------|
| **Browse** | Explore leaderboards by category |
| **+Add** | Add score, add player, or manage data |
| **⚙️** | Settings (themes, sound, display) |

### On Your Phone

1. Scan the QR code on the kiosk display
2. Or visit `http://scoreboard.local:4173`
3. Add scores from the couch!

### Adding a Score

1. Tap **+Add** → **Add Score**
2. Select player, game, mode, and (optionally) track
3. Enter the score
4. Submit and celebrate! 🎉

---

## 🎨 Themes

| Theme | Preview |
|-------|---------|
| **Dark** (default) | Classic dark mode |
| **Light** | Clean and bright |
| **OLED** | Pure black backgrounds |
| **Cyberpunk** | Neon cyan/magenta |
| **Retro** | Warm amber arcade |
| **Nature** | Forest greens |

---

## 🖥️ Raspberry Pi Deployment

### Build & Serve

```bash
npm run build
npm install -g serve pm2
pm2 start "serve -s dist -l 4173" --name scoreboard
pm2 save
pm2 startup
```

### Kiosk Auto-Start

Create `~/.config/autostart/scoreboard.desktop`:

```ini
[Desktop Entry]
Type=Application
Name=Scoreboard
Exec=chromium-browser --kiosk --noerrdialogs http://localhost:4173
```

### mDNS (scoreboard.local)

```bash
sudo apt install avahi-daemon
sudo hostnamectl set-hostname scoreboard
sudo reboot
```

### 🎃 Halloween 2026 (`halloween-2026` branch)

**Dry run** (fake racers, nothing touches Supabase):

```bash
npm run dry-run     # builds against an in-memory stand-in database; Ctrl+C to stop
npm run build       # afterwards, to point back at the real database
```

Open `http://localhost:4173/?fps=1` on the kiosk to see the frame rate. The QR
code and dry run use the Pi's home-network address; set `LAN_IP=192.168.x.x`
if they pick the wrong one.

**Sound:** connect a speaker and add `--autoplay-policy=no-user-gesture-required`
to the Chromium `Exec=` line above. Test from Settings -> Halloween Haunt.

**Haunt network (optional):** set `VITE_HAUNT_HUB=elise-pod.local:8765` in `.env`
(then `npm run build`, or `npm run dry-run`) to join the haunt-net hub. While
the spooky theme is on, the party screen connects as `scoreboard` and plays its
part of each haunt: 1 lightning + a spooky sound, 2 adds eyes and the ghost and
glitches the victim's name to DECEASED if it's on screen, 3 the jump scare
(the Settings sound/scare toggles still apply). Empty = off.

**Real database:** in the Supabase SQL Editor run `supabase/halloween-2026.sql`
(adds the Boo Cinema track), then follow the setup steps at the top of
`supabase/security.sql` (host sign-in and PIN-protected profiles), then
`npm run build`.

---

## 🧪 Testing

```bash
npm run test:e2e         # Run all 104 tests
npm run test:e2e:ui      # Interactive test UI
npm run test:e2e:headed  # Watch tests run
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [User Guide](docs/USER_GUIDE.md) | How to use all features |
| [Developer Guide](docs/DEVELOPER_GUIDE.md) | Architecture, contributing, deployment |
| [Changelog](CHANGELOG.md) | Version history |
| [Future Enhancements](docs/FUTURE_ENHANCEMENTS.md) | Roadmap and ideas |

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State:** Zustand
- **Backend:** Supabase (PostgreSQL + Realtime + Storage)
- **Testing:** Playwright

---

## 🤝 Contributing

Contributions are welcome! Please read the [Developer Guide](docs/DEVELOPER_GUIDE.md) for setup instructions and coding standards.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

Built with [Supabase](https://supabase.com), [Tailwind CSS](https://tailwindcss.com), [Framer Motion](https://framer.com/motion), and [Lucide Icons](https://lucide.dev).

---

<p align="center">
  Made with ❤️ for game rooms everywhere
</p>