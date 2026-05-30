# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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

---

## Development Log

### 2026-05-30 - Phase 1 & 2 Implementation

**Completed:**
- ✅ Dark theme with purple accent colors
- ✅ Theme toggle functionality
- ✅ Splash screen animation
- ✅ Rebranding to "Pleasure Control"
- ✅ Enhanced device cards with animations
- ✅ Visual feedback on manual controls
- ✅ Pattern preset library (10 patterns)
- ✅ Battery and signal monitoring
- ✅ Advanced modes (Surprise, Edge, Sync)
- ✅ Mode integration into navigation

**Next Steps:**
- Phase 3: Game Mode implementation
- Phase 4: Personalization (settings, statistics)
- Phase 5: PWA implementation
- Phase 6: Android packaging

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

# Or rollback to initial state (before enhancements)
git reset --hard 67bb2d4

# Rollback specific phases:
# Before Phase 1 (UI/UX):
git reset --hard 67bb2d4

# Before Phase 2 (Advanced Control):
git reset --hard 87e2801

# Before Advanced Modes:
git reset --hard ecd5a5e
```

To rollback specific files:
```bash
git checkout <commit-hash> -- <file-path>
```

---
