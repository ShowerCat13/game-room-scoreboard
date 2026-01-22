# Game Room Scoreboard - User Guide

Welcome to Game Room Scoreboard! This guide will help you get the most out of your kiosk display and mobile score entry.

---

## Table of Contents

1. [Overview](#overview)
2. [The Idle Display](#the-idle-display)
3. [Adding a Score](#adding-a-score)
4. [Adding a Player](#adding-a-player)
5. [Browsing Leaderboards](#browsing-leaderboards)
6. [Using Your Phone](#using-your-phone)
7. [Managing Data](#managing-data)
8. [Settings & Themes](#settings--themes)
9. [Bulk Import](#bulk-import)
10. [Tips & Tricks](#tips--tricks)

---

## Overview

Game Room Scoreboard is a touchscreen kiosk app that tracks high scores for your home game room. It supports:

- **Racing games** (lap times to the millisecond)
- **Golf games** (scores relative to par)
- **Party games** (points, wins)
- **Darts** (301, 501, Cricket)
- **Pinball** (high scores)
- **RPGs** (eliminations, completion %)
- And more!

The app runs on a Raspberry Pi with a 7" touchscreen, but you can also add scores from your phone.

---

## The Idle Display

When no one is interacting with the scoreboard, it shows the **Idle Display**:

```
+-------------------------------------+
|  Game Room          12:34 PM  [Gear]|
+-------------------------------------+
|                                     |
|     MARIO KART 8 - Rainbow Road     |
|                                     |
|  1st  Mike      1:58.234            |
|  2nd  Sarah     2:01.456            |
|  3rd  Emma      2:03.789            |
|       Andrew    2:05.123            |
|       James     2:08.456            |
|                                     |
|         * o o o o  (1/5)            |
+-------------------------------------+
|  [  Browse  ]         [  +Add  ]    |
+-------------------------------------+
```

### What You'll See

- **Clock** - Current time in the corner
- **Leaderboard** - Auto-cycles through different games every few seconds
- **Dots** - Shows which leaderboard you're viewing (1 of 5, etc.)
- **QR Code button** - Tap the title area to show a QR code for phone access

### Buttons

| Button | What it does |
|--------|--------------|
| **Browse** | Explore leaderboards by category |
| **+Add** | Add a new score (or player, or go to Manage) |
| **Gear icon** | Open Settings |

---

## Adding a Score

### From the Kiosk

1. Tap **+Add** on the idle screen
2. A menu appears with three options:
   - **Add Score** - Record a new high score
   - **Add Player** - Create a new player
   - **Manage...** - Go to data management
3. Tap **Add Score**
4. Select the **Player** who achieved the score
5. Select the **Game** (e.g., Mario Kart 8)
6. Select the **Mode** (e.g., 150cc Time Trial)
7. Select the **Track/Course** if applicable (e.g., Rainbow Road)
8. Enter the **Score**:
   - For times: Use the time picker (minutes, seconds, milliseconds)
   - For points: Use the number pad
   - For golf: Enter relative to par (-3, +2, etc.)
9. Tap **Submit**
10. Celebration animation plays!

### Score Formats

| Game Type | How to Enter | Example |
|-----------|--------------|---------|
| Race time (precise) | MM:SS.mmm | 1:58.234 |
| Race time (seconds) | MM:SS | 4:56 |
| Golf | Relative to par | -3, +2, E (even) |
| Points | Whole number | 15000 |
| Darts | Darts to finish | 12 |
| Percentage | Decimal | 98.45 |

---

## Adding a Player

### Quick Add (from anywhere)

1. Tap **+Add**
2. Tap **Add Player**
3. Enter the player's name
4. (Optional) Tap the avatar circle to upload a photo
5. Tap **Add Player**

### With Photo

1. When adding/editing a player, tap the **camera icon** on the avatar
2. Select a photo from your device
3. The photo uploads automatically
4. Tap the **X** on the avatar to remove it

---

## Browsing Leaderboards

Tap **Browse** to explore scores by category:

```
Categories -> Games -> Modes -> Tracks -> Leaderboard
```

### Example Flow

1. Tap **Racing**
2. Tap **Mario Kart 8**
3. Tap **150cc Time Trial**
4. Tap **Rainbow Road**
5. View the leaderboard!

### Navigation

- Tap the **back arrow** to go up one level
- Tap **Home** (house icon) to return to idle display
- Use **+Add** from any screen to quickly add a score

---

## Using Your Phone

### Connect to the Scoreboard

**Option 1: QR Code**
1. On the kiosk, tap the title area on the idle screen
2. A QR code appears
3. Scan it with your phone's camera
4. The scoreboard opens in your browser

**Option 2: Direct URL**
- If mDNS is set up: `http://scoreboard.local:4173`
- Or use the IP address: `http://192.168.x.x:4173`

### Mobile Features

The mobile interface is fully responsive:
- Same features as the kiosk
- Optimized touch targets for phone screens
- Add scores while sitting on the couch!

---

## Managing Data

Tap **+Add** -> **Manage...** (or **Settings** -> **Manage**) to access:

### Tabs

| Tab | What you can do |
|-----|-----------------|
| **Players** | Add, edit, delete players; upload avatars |
| **Games** | Add, edit, delete games; set categories |
| **Details** | Manage tracks, courses, maps per game |
| **Scores** | View, edit, delete scores; bulk import |

### Editing a Score

1. Go to **Manage** -> **Scores** tab
2. Find the score you want to edit
3. Tap the **pencil icon**
4. Update the score value
5. Tap **Save**

### Deleting Data

1. Tap the **trash icon** next to any item
2. Confirm the deletion
3. If PIN protection is enabled, enter the PIN

### PIN Protection

Destructive actions (delete) can be protected with a 4-digit PIN:
1. Go to **Settings** -> **Admin PIN**
2. Set a PIN
3. You'll need to enter it when deleting items

---

## Settings & Themes

Tap the **gear icon** to access Settings:

### Display Settings

| Setting | Options |
|---------|---------|
| **Carousel Speed** | How fast leaderboards auto-cycle (5-30 seconds) |
| **Celebration Duration** | How long the confetti plays (2-10 seconds) |

### Sound

- **Sound Effects** - Toggle on/off
- Includes: Button taps, celebrations, new high score fanfare

### Themes

Choose from 6 visual themes:

| Theme | Description |
|-------|-------------|
| **Dark** | Classic dark mode (default) |
| **Light** | Clean white background |
| **OLED** | Pure black for OLED screens |
| **Cyberpunk** | Neon cyan and magenta |
| **Retro** | Warm amber arcade vibes |
| **Nature** | Forest greens |

You can also override text colors for better readability.

---

## Bulk Import

Have a spreadsheet of old scores? Import them all at once!

### How to Import

1. Go to **Manage** -> **Scores** tab
2. Tap **Bulk Import**
3. Paste your CSV or JSON data
4. Tap **Preview Import**
5. Review for errors (red) and warnings (yellow)
6. Tap **Import X Scores**

### CSV Format

```csv
player,game,mode,score
Mike,Mario Kart 8,Rainbow Road,1:58.234
Sarah,Mario Golf,Standard,-3
Emma,Darts,501,12
```

**Required columns:** `player`, `game`, `mode`, `score`

**Optional:** `detail` (or `track`, `course`)

### Score Entry Formats

| Game Type | Enter as | Examples |
|-----------|----------|----------|
| Race (ms) | M:SS.mmm or SS.mmm | `1:58.234`, `83.456` |
| Race (sec) | M:SS or seconds | `4:56`, `296` |
| Golf | Relative to par | `-3`, `+2`, `0`, `E` |
| Points | Number | `15000` |

### Fuzzy Matching

The importer is smart! It will match:
- `mario kart` -> **Mario Kart 8**
- `rainbow` -> **Rainbow Road**
- `mike` -> **Mike** (case insensitive)

Warnings appear if it had to guess - review them before importing.

---

## Tips & Tricks

### Quick Score Entry
From the idle screen: **+Add** -> **Add Score** is the fastest path.

### Couch Mode
Scan the QR code once and bookmark it on your phone. Add scores without getting up!

### Celebrations
First place scores get a special gold celebration with fanfare. Other placements get a standard chime.

### Real-time Updates
Scores update instantly! If someone adds a score from their phone, the kiosk display updates automatically.

### OLED Theme
If your display is OLED, use the OLED theme to prevent burn-in and save power.

### Bulk Import Tip
Export from a spreadsheet app (Excel, Google Sheets) as CSV, then paste directly into the import box.

### Game Categories
Games are organized by category (Racing, Golf, Party, etc.) for easy browsing. Set the category when adding a game in Manage.

---

## Troubleshooting

### Score won't submit
- Make sure all fields are selected (player, game, mode)
- Check that the score value is valid for the format

### Can't connect from phone
- Make sure your phone is on the same WiFi network
- Try the IP address instead of `scoreboard.local`
- Check that the Pi is running (`pm2 status`)

### Leaderboard not updating
- Pull down to refresh (on mobile)
- Check your internet connection to Supabase

### Forgot admin PIN
- PINs are stored locally - clear browser data to reset
- Or access Settings from a different device

---

## Need Help?

- **GitHub Issues:** Report bugs or request features
- **README:** Technical setup and deployment info
- **CHANGELOG:** See what's new in each version

Enjoy tracking your high scores!