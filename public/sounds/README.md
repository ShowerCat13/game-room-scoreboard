# Haunt sounds

Drop audio clips here named after a slot, as `.mp3`, `.ogg` or `.wav`
(for example `ghost_laugh.mp3`). A slot with no file falls back to a
synthesized sound, so every slot is optional.

| Slot | Used for |
|------|----------|
| `ghost_laugh` | Ambient; idle haunting |
| `zombie_groan` | Ambient |
| `witch_cackle` | Ambient |
| `wolf_howl` | Ambient |
| `creaky_door` | Ambient |
| `evil_laugh` | Ambient; jump scares |
| `thunder` | Lightning strikes |
| `scream` | Jump scares |
| `heartbeat` | Reserved |

Keep clips short (1-6 s) and small (under ~500 KB). Only add files you have
the rights to redistribute, and record each file's source and license in
`CREDITS.md` in this folder.

Test from **Settings -> Halloween Haunt** (Test ghost laugh / Test jump scare).
Sound needs Chromium's autoplay policy relaxed on the kiosk; add
`--autoplay-policy=no-user-gesture-required` to the kiosk launch command.
