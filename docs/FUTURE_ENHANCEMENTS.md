# Future Enhancements — Game Room Scoreboard

Ideas and roadmap for future development. Contributions welcome!

---

## 🎯 High Priority (v1.1.0)

### Player Statistics Dashboard
**Effort:** Medium (8-12 hours)

Add a stats page for each player showing:
- Total games played
- Win rate (1st place finishes)
- Average placement
- Best scores per game
- Recent activity
- Rivalry stats (head-to-head records)

```
┌─────────────────────────────────────┐
│  👤 Mike's Stats                    │
├─────────────────────────────────────┤
│  Games Played: 147                  │
│  Win Rate: 34%                      │
│  Avg Placement: 2.3                 │
│                                     │
│  Best Scores:                       │
│  🏎️ MK8 Rainbow Road: 1:58.234     │
│  ⛳ Mario Golf: -6                  │
│                                     │
│  Rivals:                            │
│  vs Sarah: 23-18 (56% win rate)    │
└─────────────────────────────────────┘
```

**Implementation:**
- New `PlayerStats` page
- Aggregate queries in Supabase (or computed views)
- Cache results for performance

---

### Score History / Trends
**Effort:** Medium (6-8 hours)

Show how scores have improved over time:
- Line chart of personal bests
- Progress indicators (🔺 improved, 🔻 declined)
- "Your best ever!" badges

**Implementation:**
- Install Recharts (npm install recharts)
- Query historical scores with timestamps
- Optional: Supabase Edge Function for aggregation

---

### Achievements / Badges
**Effort:** Medium (10-15 hours)

Award badges for milestones:
- 🥇 **First Win** — First 1st place finish
- 🔥 **On Fire** — 3 wins in a row
- 🎯 **Perfectionist** — Sub-2:00 on Rainbow Road
- 🏆 **Champion** — 50 total wins
- 🌙 **Night Owl** — Score added after midnight
- 📈 **Improver** — Beat personal best 10 times

**Implementation:**
- `achievements` table (id, name, description, icon, criteria)
- `player_achievements` table (player_id, achievement_id, earned_at)
- Trigger function to check criteria on score insert
- Achievement toast/popup when earned

---

## 🎮 Game Experience

### Tournament Mode
**Effort:** High (20+ hours)

Run organized competitions:
- **Bracket tournaments** — Single/double elimination
- **Round robin** — Everyone plays everyone
- **Race series** — Points across multiple tracks
- Live standings display

**Implementation:**
- New tables: `tournaments`, `tournament_rounds`, `tournament_entries`
- Tournament creation wizard
- Live bracket visualization
- Scheduling support

---

### Handicap System
**Effort:** High (15-20 hours)

Level the playing field for mixed skill groups:
- Calculated handicaps based on history
- Adjusted scores for fair competition
- Optional per-game or global handicaps

**Implementation:**
- Rolling average calculation
- Handicap display on leaderboards (gross vs net)
- Settings to enable/disable

---

### Quick Play / Guest Mode
**Effort:** Low (2-3 hours)

For casual players who don't want a profile:
- "Quick Add" without selecting player
- Temporary "Guest 1", "Guest 2" entries
- Option to claim/convert guest scores later

**Implementation:**
- Reserved "guest" player records
- Claim flow with PIN verification

---

## 📱 Mobile & Accessibility

### Progressive Web App (PWA)
**Effort:** Low (3-4 hours)

Make the mobile experience better:
- Add to Home Screen prompt
- Offline indicator (graceful degradation)
- Push notifications for new high scores

**Implementation:**
- Add `manifest.json`
- Register service worker
- Cache static assets

---

### Voice Announcements
**Effort:** Medium (4-6 hours)

"New high score by Mike! One fifty-eight point two three four!"

- Announce new scores audibly
- Configurable voice and volume
- Option to announce top 3 only

**Implementation:**
- Web Speech API (`speechSynthesis`)
- Score-to-speech formatting
- Settings toggle

---

### Large Display Mode
**Effort:** Low (2-3 hours)

For bigger screens (TV, projector):
- 1080p / 4K layouts
- Larger fonts and elements
- "Spectator" view without controls

**Implementation:**
- Responsive breakpoints for larger screens
- Simplified read-only view option

---

## 🔧 Technical Improvements

### Offline Support
**Effort:** High (15-20 hours)

Work without internet:
- Cache leaderboards locally
- Queue score submissions
- Sync when online

**Implementation:**
- IndexedDB for local storage
- Service worker for caching
- Conflict resolution strategy

---

### Multi-Household / Multi-Tenancy
**Effort:** High (20+ hours)

Support multiple separate scoreboards:
- Household/group isolation
- Invite system
- Separate leaderboards per group

**Implementation:**
- Add `household_id` to all tables
- Row-level security policies
- Invitation/join flow

---

### Data Export
**Effort:** Low (2-3 hours)

Download your data:
- Export all scores as CSV/JSON
- Export player data
- Backup/restore functionality

**Implementation:**
- Export button in Settings
- Server-side CSV generation (Edge Function)
- Or client-side with existing data

---

### Supabase Edge Functions
**Effort:** Medium (varies)

Move complex logic server-side:
- Leaderboard calculations
- Achievement checking
- Statistics aggregation
- Scheduled cleanup jobs

**Implementation:**
- Deno-based Edge Functions
- Webhook triggers on score insert

---

## 🎨 Visual Enhancements

### Game Box Art
**Effort:** Low (3-4 hours)

Show cover images for games:
- Upload custom images
- Or fetch from IGDB/RAWG API
- Display in game selection

**Implementation:**
- Add `cover_url` to games table
- Upload to Supabase Storage
- Optional: API integration for auto-fetch

---

### Animated Backgrounds
**Effort:** Low (2-3 hours)

Per-category animated backgrounds:
- Racing: Moving road lines
- Golf: Swaying grass
- Darts: Rotating dartboard
- Subtle, non-distracting

**Implementation:**
- CSS animations or Lottie files
- Category-based background component

---

### Custom Celebrations
**Effort:** Medium (4-6 hours)

Personalized celebrations per game/player:
- Mario Kart: Checkered flag animation
- Golf: Golf ball rolling
- Player-specific songs/sounds

**Implementation:**
- Celebration "packs" configuration
- Upload custom sounds
- Per-game/player settings

---

## 🔗 Integrations

### Twitch/YouTube Integration
**Effort:** High (15-20 hours)

For streamers:
- Overlay widget for OBS
- Chat commands (!scores, !leaderboard)
- Score announcements in chat

**Implementation:**
- Read-only embed endpoint
- Twitch chatbot integration
- OBS browser source compatible widget

---

### Discord Integration
**Effort:** Medium (6-8 hours)

- Post new high scores to Discord channel
- Discord bot for querying scores
- Webhook notifications

**Implementation:**
- Discord webhook on score insert
- Optional: Full Discord bot

---

### Smart Home Integration
**Effort:** Medium (8-12 hours)

- Home Assistant integration
- Trigger lights on new high score
- Voice control via Alexa/Google

**Implementation:**
- MQTT broker support
- Home Assistant custom component
- REST API for external access

---

## 📊 Analytics

### Usage Analytics
**Effort:** Low (2-3 hours)

Track (privacy-respecting) usage:
- Most played games
- Peak hours
- Feature usage

**Implementation:**
- Optional analytics toggle
- Simple event tracking
- Dashboard in Settings

---

### Leaderboard Insights
**Effort:** Medium (4-6 hours)

- "Closest competition" — Games with tight scores
- "Dominant player" — Who owns which games
- "Underdog alerts" — When rankings might flip

**Implementation:**
- Analytical queries
- Insights cards on dashboard

---

## 🛡️ Administration

### User Roles
**Effort:** Medium (8-10 hours)

Different permission levels:
- **Admin** — Full access
- **Player** — Add scores, view leaderboards
- **Guest** — View only

**Implementation:**
- Add `role` to players
- Permission checks in UI
- RLS policies in Supabase

---

### Audit Log
**Effort:** Medium (4-6 hours)

Track all changes:
- Who added/edited/deleted what
- Timestamps
- Rollback capability

**Implementation:**
- `audit_log` table
- Database triggers
- Admin view in Manage

---

### Scheduled Backups
**Effort:** Low (2-3 hours)

Automatic backups:
- Daily database exports
- Store in Supabase Storage
- Retention policy

**Implementation:**
- Supabase scheduled function
- pg_dump equivalent

---

## 📱 Platform Expansion

### Native Mobile App
**Effort:** Very High (40+ hours)

React Native or Expo app:
- Push notifications
- Native performance
- App store distribution

### Desktop App
**Effort:** High (20+ hours)

Electron wrapper:
- Menu bar widget
- System tray quick-add
- Native notifications

---

## 🗳️ Community Voting

Want to influence the roadmap? Future versions may include:
- GitHub Discussions for feature requests
- Upvoting system
- Community polls

---

## Contributing

Pick an enhancement and submit a PR! See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for setup instructions.

When implementing:
1. Create an issue first to discuss approach
2. Keep PRs focused (one feature per PR)
3. Add tests for new functionality
4. Update documentation

---

## Version Targets

| Version | Focus |
|---------|-------|
| **1.1.0** | Player stats, achievements |
| **1.2.0** | Tournament mode |
| **1.3.0** | PWA, offline improvements |
| **2.0.0** | Multi-tenancy, user roles |
