# Game Room Scoreboard

A Raspberry Pi-based kiosk application for displaying and managing high scores across a variety of games.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL + Realtime + Storage)
- **State Management**: Zustand
- **Routing**: React Router

## Project Structure

```
src/
├── components/
│   ├── layout/          # KioskLayout, Header
│   ├── display/         # ScoreRow, ScoreValue, PlayerAvatar, etc.
│   ├── input/           # Form components for score entry
│   ├── cards/           # CategoryButton, GameCard, ModeCard
│   ├── overlays/        # CelebrationOverlay, RealtimeAlert
│   └── ui/              # Reusable UI components
├── pages/               # Route-level components
├── hooks/               # Custom React hooks for data fetching
├── lib/                 # Supabase client, types, utilities
└── stores/              # Zustand state management
```

## Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- npm or yarn
- Supabase account

### Setup

1. **Install dependencies**:

```bash
npm install
```

2. **Set up environment variables**:

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Set up Supabase**:

- Create a new Supabase project at [supabase.com](https://supabase.com)
- Run the SQL schema from `supabase/schema.sql` in the SQL Editor
- Run the seed data from `supabase/seed.sql` (optional)
- Create storage buckets for `avatars` and `game-icons`

4. **Start development server**:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Raspberry Pi Deployment

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed deployment instructions.

Quick start:

1. Build the app: `npm run build`
2. Copy `dist/` folder to Raspberry Pi
3. Serve with: `npm run preview -- --host`
4. Set up Chromium kiosk mode (see ARCHITECTURE.md)

## Development

### Type Generation

After making changes to the Supabase schema, regenerate types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/types.ts
```

Or manually update [src/lib/types.ts](src/lib/types.ts) to match your schema.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and technical details
- [UI_SPEC.md](./UI_SPEC.md) - Detailed UI component specifications

## Features

- ✅ Auto-cycling leaderboard display
- ✅ Touch-friendly browsing interface
- ✅ Real-time score updates via Supabase
- ✅ Multiple score formats (time, points, percentages, etc.)
- ✅ Player management with avatars
- ✅ Category-based game organization
- 🚧 Celebration animations (coming soon)
- 🚧 Sound effects (coming soon)
- 🚧 Settings panel (coming soon)

## License

Private project - All rights reserved
