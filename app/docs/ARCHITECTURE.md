# Architecture

This document describes the system architecture, data flow, component hierarchy, and state management of the Sex Controller application.

---

## System Architecture

The application is a single-page React application that communicates with hardware devices through a multi-layered protocol stack.

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Browser (Client-Side)                       │
│                                                                  │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│   │   React App    │  │  Web Audio API  │  │    Canvas API   │   │
│   │   (UI Layer)   │  │  (Analysis)    │  │  (Rendering)   │   │
│   └───┬────────────┘  └─────────────────┘  └─────────────────┘   │
│        │                                                         │
│   ┌───────────────────────────────────────────────────┐    │
│   │              Custom React Hooks (State Layer)              │    │
│   │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │    │
│   │  │ useButtplug  │ │  useWaveform   │ │ useAudioAnalysis│  │    │
│   │  │ (Device I/O) │ │ (Patterns)    │ │ (Audio I/O)    │  │    │
│   │  └────┬──────────┘ └─────────────────┘ └─────────────────┘  │    │
│   └───────┬───────────────────────────────────────────────┘    │
│             │                                                    │
│        WebSocket (port 12345)                                    │
└────────────┬───────────────────────────────────────────────────────────┘
                 │
┌────────────┬───────────────────────────────────────────────────────────┐
│           intiface-engine (Rust WebSocket Server)                │
│                                                                  │
│   ┌───────────────────────────────────────────────────┐    │
│   │  Buttplug Protocol V4 (patched client, strict server)   │    │
│   └───────────────────────────────────────────────────┘    │
│                              │                                   │
│                       BlueZ / BLE                               │
└────────────────────┬───────────────────────────────────────────────┘
                            │
┌───────────────────────────────────────────────────┐
│              BLE Intimate Device (e.g., Libo Miao)             │
│                                                                  │
│   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│   │   Vibrate    │ │   Rotate     │ │  Oscillate   │   │
│   │  (0-100%)    │ │  (0-100%)   │ │  (0-100%)   │   │
│   └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└───────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Connection Establishment

```
User clicks "Connect to Intiface"
        │
        ▼
useButtplug.connect()
        │
        ▼
ButtplugClient.connect(ButtplugBrowserWebsocketClientConnector)
        │
        ▼
WebSocket handshake → ws://localhost:12345
        │
        ▼
intiface-engine accepts connection
        │
        ▼
ButtplugClient requests device list
        │
        ▼
Device list stored in Map<number, DeviceState>
```

### 2. Device Scanning

```
User clicks "Scan Devices"
        │
        ▼
useButtplug.startScanning()
        │
        ▼
ButtplugClient.startScanning() → BLE discovery begins
        │
        ▼
Polling: requestDeviceList() every 2 seconds
        │
        ▼
Device found → "deviceadded" event → syncDevices()
        │
        ▼
Map updated → React re-render → UI shows device
```

### 3. Manual Control Flow

```
User moves slider (e.g., Vibration 0% → 50%)
        │
        ▼
ManualControlPanel.handleVibrateChange(deviceId, 0.5)
        │
        ▼
Update local DeviceState (optimistic UI)
        │
        ▼
ButtplugClientDevice.runOutput(DeviceOutput.Vibrate.percent(0.5))
        │
        ▼
WebSocket → OutputCmd { Vibrate: { Value: 0.5, Duration: ... } }
        │
        ▼
intiface-engine translates to BLE GATT commands
        │
        ▼
Device motor activates at 50% intensity
```

### 4. Waveform Pattern Flow

```
User clicks "Play" on a pattern
        │
        ▼
useWaveform.startPlayback(pattern)
        │
        ▼
requestAnimationFrame loop begins → currentTime increments
        │
        ▼
WaveformPlayer (useEffect) detects isPlaying + currentTime change
        │
        ▼
getIntensityAtTime(pattern, currentTime) → interpolated value
        │
        ▼
If intensity delta > 0.02: send to all devices via runOutput()
        │
        ▼
Devices update in real-time synchronized to pattern
```

### 5. Audio Reactive Flow

```
User uploads MP3/WAV/OGG file
        │
        ▼
useAudioAnalysis.loadFile(file)
        │
        ▼
AudioContext.decodeAudioData() → AudioBuffer
        │
        ▼
Process: 200-bin RMS average → normalized waveformData[]
        │
        ▼
User clicks "Play"
        │
        ▼
AudioBufferSourceNode → GainNode → AnalyserNode → destination
        │
        ▼
AudioPlayer (useEffect) reads playbackTime
        │
        ▼
waveformData[index] * intensityScale → vibration intensity
        │
        ▼
If delta > 0.03: send to devices via runOutput()
        │
        ▼
Vibrations sync to audio amplitude in real-time
```

---

## Component Hierarchy

```
main.tsx
└── StrictMode
    └── BrowserRouter
        └── App.tsx
            └── Routes
                └── Route "/"
                    └── Home.tsx (pages/Home.tsx)
                        ├── useButtplug() hook
                        ├── useWaveform() hook
                        ├── useAudioAnalysis() hook
                        │
                        └── Layout.tsx
                        │   ├── Header (sticky, mobile-responsive)
                        │   ├── Desktop Sidebar (lg breakpoint)
                        │   └── Mobile Navigation (collapsible)
                        │
                        ├── WaveformPlayer.tsx (invisible bridge)
                        ├── AudioPlayer.tsx (invisible bridge)
                        │
                        └── Active Tab Content (renderTab())
                            ├── DevicePanel.tsx
                            │   ├── ConnectionStatus Card
                            │   └── ConnectedDevices Card
                            │
                            ├── ManualControlPanel.tsx
                            │   ├── Tab Toggle (Individual / Master)
                            │   ├── Master Control Card (when master tab)
                            │   └── Device Cards (when individual tab)
                            │       ├── Vibrate Slider
                            │       ├── Rotate Slider
                            │       └── Oscillate Slider
                            │
                            ├── WaveformPanel.tsx
                            │   ├── CreatePattern Card
                            │   └── Pattern List
                            │       ├── Canvas Preview (waveform-canvas-{id})
                            │       ├── Edit Mode: Canvas Editor + Controls
                            │       └── Play Mode: Playback Buttons
                            │
                            ├── AudioPanel.tsx
                            │   ├── Upload Card
                            │   └── Waveform Analysis Card
                            │       ├── Canvas Waveform Display
                            │       ├── Intensity Scale Slider
                            │       └── Playback Controls
                            │
                            └── GuidePanel.tsx
                                ├── Getting Started Steps
                                ├── Troubleshooting Section
                                └── Tips & Best Practices
```

### Key Design Decisions

1. **Invisible Bridge Components**: `WaveformPlayer` and `AudioPlayer` are renderless components that sit in the tree and use `useEffect` to translate playback state into device commands. This separates timing logic from UI.

2. **Hook Separation**: Each major feature (devices, waveforms, audio) is isolated in its own hook. They communicate only through the `Home` page component, which passes data down as props.

3. **Canvas for Visualization**: Waveform previews and the audio analyzer use HTML5 Canvas (not SVG) for performance, with DPR-aware rendering for crisp displays on high-density screens.

4. **shadcn/ui Primitives**: All UI components build on Radix UI primitives through shadcn/ui, ensuring accessibility and consistent styling via Tailwind CSS.

---

## State Management

### useButtplug

Manages the entire device connection lifecycle.

```typescript
interface ButtplugState {
  client: ButtplugClient | null;
  isConnected: boolean;
  isConnecting: boolean;
  isScanning: boolean;
  error: string | null;
  devices: Map<number, DeviceState>;  // Key: device index
}
```

| State | Type | Purpose |
|-------|------|---------|
| `client` | `ButtplugClient \| null` | Active Buttplug client instance |
| `isConnected` | `boolean` | WebSocket connection status |
| `isScanning` | `boolean` | BLE discovery active |
| `devices` | `Map<number, DeviceState>` | Connected devices with UI state |

**Key behaviors:**
- `syncDevices`: Maps `ButtplugClient.devices` (a `Map`) to React state, preserving existing `DeviceState` to avoid resetting slider positions
- `startScanning`: Initiates BLE scan + starts 2-second polling for `requestDeviceList()` because intiface-engine may not send unsolicited updates
- `updateDeviceState`: Optimistic UI updates for slider movements before commands complete

### useWaveform

Manages pattern data and playback timing.

```typescript
interface WaveformState {
  patterns: WaveformPattern[];
  activePattern: WaveformPattern | null;
  isPlaying: boolean;
  currentTime: number;
  editingPattern: WaveformPattern | null;
}
```

**Key behaviors:**
- `getIntensityAtTime`: Linear interpolation between control points. For looping patterns, time wraps with modulo.
- Animation loop uses `requestAnimationFrame` for smooth 60 FPS timing
- 5 built-in patterns: Sine Wave, Ramp Up, Ramp Down, Pulse, Quick Wave

### useAudioAnalysis

Manages audio file loading, decoding, analysis, and playback.

```typescript
interface AudioState {
  file: File | null;
  audioBuffer: AudioBuffer | null;
  waveformData: number[];     // 200 normalized RMS samples
  duration: number;
  isPlaying: boolean;
  playbackTime: number;
  intensityScale: number;     // 0.1 - 2.0 multiplier
}
```

**Key behaviors:**
- `AudioContext` is lazily created on first file load
- Audio is decoded into an `AudioBuffer`, then downsampled to 200 bins using RMS averaging
- `getIntensityAtTime` samples the waveform array at the current playback position

---

## Hook Responsibilities

### `useButtplug.ts` -- Device I/O Hook

**Responsibility:** All communication with the Buttplug protocol and hardware.

| Function | Purpose |
|----------|---------|
| `connect()` | Create `ButtplugClient`, attach event listeners, establish WebSocket |
| `disconnect()` | Clean disconnect, clear timers, reset state |
| `startScanning()` | Begin BLE discovery with 30s auto-timeout |
| `stopScanning()` | Halt discovery, clear polling interval |
| `stopAllDevices()` | Send `stopAllDevices()` command, reset all slider states |
| `updateDeviceState()` | Optimistic state update for UI sliders |
| `getDevice()` | Look up `ButtplugClientDevice` by index for command execution |
| `syncDevices()` | Reconcile server device list with local React state |

**Event listeners:**
- `deviceadded`: New device discovered
- `deviceremoved`: Device disconnected
- `disconnect`: Server connection lost

**Timers:**
- `scanTimerRef`: 30-second auto-stop timeout
- `pollTimerRef`: 2-second device list polling during scans

### `useWaveform.ts` -- Pattern Engine Hook

**Responsibility:** Pattern storage, editing, and playback timing.

| Function | Purpose |
|----------|---------|
| `getIntensityAtTime(pattern, time)` | Linear interpolation of intensity at any time offset |
| `startPlayback(pattern)` | Begin animation loop, reset timer |
| `stopPlayback()` | Halt animation, reset to time 0 |
| `pausePlayback()` | Halt animation, preserve current time |
| `createPattern(name, duration, loop)` | Add new pattern with default 5-point envelope |
| `updatePattern(id, updates)` | Modify name, duration, or loop flag |
| `deletePattern(id)` | Remove pattern, stop if currently playing |
| `updatePatternPoints(id, points)` | Update control points (used by canvas editor) |

**Animation:**
- `requestAnimationFrame` loop computes elapsed time from `performance.now()`
- For looping patterns: `effectiveTime = time % pattern.duration`
- For non-looping patterns: stops when `elapsed >= duration`

### `useAudioAnalysis.ts` -- Audio Engine Hook

**Responsibility:** Audio file processing, waveform analysis, and playback.

| Function | Purpose |
|----------|---------|
| `loadFile(file)` | Decode audio, compute 200-bin RMS waveform |
| `play()` | Create `AudioBufferSourceNode`, start playback, begin RAF time tracking |
| `stop()` | Stop source, reset playback state |
| `getIntensityAtTime(time)` | Sample waveform at current playback position |
| `setIntensityScale(v)` | Adjust vibration strength multiplier |

**Audio graph:**
```
AudioBufferSourceNode → GainNode → AnalyserNode → AudioContext.destination
                              → (also used for visualization if needed)
```

**Analysis:**
- 200 samples across the full audio duration
- Each bin: average of absolute sample values (`sum(|x|) / count`)
- Normalized to maximum value in the array

---

## The Patch System

The application depends on `buttplug` npm v4.0.2, which contains a protocol bug. The library sends:

```javascript
// Bug (buttplug 4.0.2 unpatched)
{ Value: [10], Duration: ... }   // Array
```

But `intiface-engine` v4.0.2 expects:

```javascript
// Correct (after patch)
{ Value: 10, Duration: ... }      // Scalar
```

The patch is applied automatically via `patch-package` in the `postinstall` script. It modifies:

```
node_modules/buttplug/dist/main/client/ButtplugClientDeviceFeature.js
```

Changing line 98 from:
```javascript
let newCommand = { Value: [value], Duration: duration };
```
to:
```javascript
let newCommand = { Value: value, Duration: duration };
```

If the patch is not applied, all device commands will be rejected by the server with a schema validation error.

**Important:** Vite caches pre-bundled dependencies in `node_modules/.vite/`. If you apply the patch after Vite has already cached the unpatched version, you must clear the cache:

```bash
rm -rf node_modules/.vite
```

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for more on managing patches.
