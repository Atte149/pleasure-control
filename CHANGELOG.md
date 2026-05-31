# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Bug Fixes - 2026-05-31

#### Fixed
- **Critical**: Fixed missing `await` on device.stop() in individual device stop button
  - Previously: device.stop() called without waiting, could fail silently
  - Now: Properly awaits all intensity changes and stop command with timeout
  - Matches the pattern used in stopAll() function
- **Critical**: Fixed race condition in preset pattern loading
  - Previously: Used name-based lookup which could apply points to wrong pattern
  - Now: Uses returned pattern ID directly, eliminating race condition
  - Prevents bugs when multiple patterns share the same name
- **Medium**: Fixed Remove button deleting last point when no point selected
  - Previously: `draggingPoint ?? pattern.points.length - 1` removed last point
  - Now: Button disabled when no point selected (draggingPoint === null)
  - Only removes the actually selected point

### Phase 6: Android Packaging - COMPLETED ✅

#### Added
- Capacitor 6 integration (core, cli, android) — pinned to v6 for Node 20
- Native Android project under `app/android/`
- `capacitor.config.ts` — appId `com.pleasurecontrol.app`, cleartext enabled
- `android:usesCleartextTraffic="true"` + INTERNET permission in manifest
  (required for ws:// connection to Intiface over LAN)
- Built debug APK: `builds/PleasureControl-debug.apk` (~3.9 MB)
  - minSdk 22 (Android 5.1+), targetSdk 34, version 1.0
- npm scripts: `android:sync`, `android:apk`, `android:open`
- `ANDROID.md` with install, rebuild, release-signing, and connection guide
- **Intiface Mobile support** — autonomous BLE control from phone without PC:
  - Android platform auto-detection (`isAndroid()` in serverConfig)
  - Default server URL on Android: `ws://localhost:12345` (Intiface Mobile on device)
  - DevicePanel shows blue info box on Android with Play Store install link
  - Updated ANDROID.md: Variant A (Intiface Mobile, recommended) + Variant B (PC over Wi-Fi)

#### Changed (connection refactor — prerequisite for Android)
- Intiface server address is now configurable instead of hardcoded
- `src/lib/serverConfig.ts` — get/set/normalize URL, persisted to localStorage
- `useButtplug` reads the configured URL at connect time
- DevicePanel shows an editable "Intiface Server Address" field when disconnected
  (lets a phone reach Intiface on a PC by IP, e.g. ws://192.168.1.100:12345)

#### Fixed (earlier this session)
- Dev server now binds to all interfaces (`server.host: true`) for LAN access

---

### Phase 1: UI/UX Modernization - COMPLETED ✅

#### Added
- Dark theme with purple/magenta accent colors (280° hue)
- ThemeProvider with localStorage persistence
- ThemeToggle component with animated sun/moon icons
- Animated splash screen with gradient background and pulsing logo
- Custom CSS animations: pulse-slow, gradient, glass-effect
- Gradient logo with shadow effects in header
- Rebranded from "Buttplug Controller" to "Pleasure Control"
- Enhanced device cards with staggered fade-in animations
- Gradient backgrounds on device icons with pulse animation
- Hover effects with scale and shadow on interactive elements
- Visual feedback on manual control sliders (gradient progress bars)
- Colored percentage displays (primary for vibrate, accent for rotate)

#### Changed
- Updated CSS variables with modern color scheme
- Enhanced dark theme with deeper backgrounds (240° 10% 8%)
- Improved connection status badges with dark mode support
- Better visual hierarchy throughout the application
- Smooth transitions on all interactive elements (300ms)

### Phase 2: Advanced Device Control - COMPLETED ✅

#### Added
- Pattern preset library with 10 pre-made patterns
  - Wave, Pulse, Earthquake, Fireworks, Escalate
  - Heartbeat, Random, Gentle Wave, Stairway, Tsunami
- Pattern categories: gentle, intense, rhythmic, random
- PatternPresets component with tabbed interface
- Pattern import/export functionality (JSON)
- Battery level monitoring with color-coded indicators
- Signal strength (RSSI) display for devices
- BatteryIndicator component with dynamic icons
- Advanced control modes:
  - **Surprise Me**: Random pattern switching (5-60s intervals)
  - **Edge Mode**: Build-hold-drop cycle with progress tracking
  - **Sync Mode**: Synchronized multi-device control
- AdvancedModes component with dedicated UI
- useAdvancedModes hook for mode management
- Real-time intensity control from modes
- Configurable parameters for each mode

#### Changed
- Renamed "waveform" tab to "patterns" for clarity
- Added "modes" tab to navigation
- Reorganized navigation structure (6 tabs total)
- Enhanced pattern cards with animations and ring effects
- Play button now uses gradient background
- Pattern list shows empty state with helpful message
- Device cards now display battery and signal info

#### Technical
- Added batteryLevel and rssi fields to DeviceState type
- Created pattern preset system with utility functions
- Integrated modes into main application flow
- Connected mode intensity changes to device control

### Phase 3: Game Mode - COMPLETED ✅

#### Added
- Game mode with 5 interactive mini-games:
  1. **Pleasure Roulette**: Random intensity and duration (5-15s)
  2. **Dice Roll**: Roll 1-6, maps to intensity levels
  3. **Card Draw**: Draw playing card, face cards = high intensity
  4. **Timer Challenge**: Hold specific intensity for set duration
  5. **Progressive Mode**: Gradually increase intensity over time
- useGameMode hook for game logic and state management
- GameMode component with dedicated UI for each game
- Game history tracking with scrollable list
- Real-time intensity control from games to devices
- Visual feedback with animated badges and result displays
- Configurable parameters for each game

#### Changed
- Added "games" tab to navigation (7 tabs total)
- Each game has unique mechanics and visual style
- Auto-stop after game completion
- Only one game can be active at a time

### Phase 4: Personalization - COMPLETED ✅

#### Added
- Comprehensive settings panel with statistics
- useSettings hook for settings and stats management
- Usage statistics tracking:
  - Total sessions and weekly sessions
  - Total duration and average intensity
  - Top 5 most used patterns
  - Top 3 most used modes
  - Top 3 most played games
- Safety and default settings:
  - Maximum intensity limit (30-100%)
  - Default intensity for quick start
  - Auto-stop timeout (5-60 minutes)
- Personalization options:
  - 6 accent color themes (Purple, Pink, Blue, Green, Orange, Red)
  - Haptic feedback toggle (mobile)
  - Sound effects toggle
  - Confirm destructive actions option
- Data management:
  - Export settings and stats to JSON
  - Import from backup file
  - Reset to defaults
  - Clear statistics
- All settings persist to localStorage

#### Changed
- Replaced "Guide" tab with "Settings" tab
- Navigation now has 7 tabs with Settings at the end
- Statistics automatically track usage patterns

---

## Development Log

### 2026-05-30 - Phases 1-4 Implementation

**Completed:**
- ✅ Phase 1: UI/UX Modernization (11 commits)
- ✅ Phase 2: Advanced Device Control (5 commits)
- ✅ Phase 3: Game Mode (1 commit)
- ✅ Phase 4: Personalization (1 commit)

**Total Progress:**
- 20+ commits
- 1000+ lines of new code
- 7 navigation tabs
- 10 pattern presets
- 3 advanced modes
- 5 mini-games
- Full statistics tracking
- Complete settings panel

**Next Steps:**
- Phase 5: PWA implementation (offline support, installable)
- Phase 6: Android packaging (Capacitor, native APK)

---

## Initial State (v0.0.0)
- Basic Buttplug.io integration
- Device connection via WebSocket
- Manual control panel with sliders
- Waveform pattern creation
- Audio-reactive control
- Guide panel

---

## Rollback Instructions

To rollback to any previous state:
```bash
# View all commits
git log --oneline

# Rollback to specific commit
git reset --hard <commit-hash>

# Rollback to initial state (before enhancements)
git reset --hard 67bb2d4

# Rollback to specific phases:
# Before Phase 1 (UI/UX):
git reset --hard 67bb2d4

# Before Phase 2 (Advanced Control):
git reset --hard 87e2801

# Before Phase 3 (Game Mode):
git reset --hard f874877

# Before Phase 4 (Personalization):
git reset --hard 91e5b14
```

To rollback specific files:
```bash
git checkout <commit-hash> -- <file-path>
```

---
