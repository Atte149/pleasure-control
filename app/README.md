# Sex Controller

A modern web application for controlling intimate devices via the [Buttplug.io](https://buttplug.io/) protocol. Built with React 19, TypeScript, and Vite, it supports manual control, custom waveform patterns, and audio-reactive vibration.

> **Note:** This project is a working title and will be renamed before publication.

---

## Features

| Feature | Description |
|---------|-------------|
| **Device Management** | Connect to Intiface Engine via WebSocket, scan for BLE devices, view connection status |
| **Manual Control** | Per-device sliders for Vibrate, Rotate, and Oscillate with capability detection |
| **Master Control** | Control all connected devices simultaneously from a single panel |
| **Waveform Patterns** | Create, edit, and play custom vibration patterns (sine, ramp, pulse, etc.) with loop support |
| **Audio Reactive** | Upload audio files, analyze waveform amplitude, and sync vibrations to music in real-time |
| **Responsive Design** | Optimized for desktop and mobile with a collapsible sidebar and touch-friendly controls |

---

## Quick Start

### Prerequisites

- **Linux** with Bluetooth LE support (BlueZ)
- **Node.js** 20 or higher
- A Bluetooth adapter (USB dongle or built-in)
- **intiface-engine** running on port 12345

### 1. Install intiface-engine

```bash
cargo install intiface-engine
```

Or download a pre-built binary from [github.com/intiface/intiface-engine](https://github.com/intiface/intiface-engine).

Run the server:

```bash
intiface-engine --websocket-port 12345 --websocket-use-all-interfaces --use-bluetooth-le --log info
```

For a persistent service, see [docs/SETUP.md](docs/SETUP.md#systemd-service-setup).

### 2. Clone and Install

```bash
git clone <repository-url>
cd pleasure-control/app
npm install
```

The `postinstall` script automatically applies the necessary patch to the `buttplug` library. See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#the-patch-system-explained) for details.

### 3. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 4. Connect and Control

1. Ensure `intiface-engine` is running on port 12345
2. Open the app in your browser
3. Go to the **Devices** tab
4. Click **Connect to Intiface**
5. Put your device in pairing mode (usually: press and hold the power button until LED blinks)
6. Click **Scan Devices**
7. Wait 10--15 seconds for BLE negotiation
8. Your device appears in the list -- switch to **Manual**, **Waveform**, or **Audio** to control it

---

## Screenshots

> Screenshots will be added before publication. The app consists of five main tabs:
>
> 1. **Devices** -- Connection status, scan controls, and connected device list
> 2. **Manual** -- Individual per-device sliders and a Master Control panel
> 3. **Waveform** -- Pattern library with canvas-based editor and playback controls
> 4. **Audio** -- Audio upload, waveform visualization, and intensity scaling
> 5. **Guide** -- In-app getting started guide and troubleshooting tips

---

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/SETUP.md](docs/SETUP.md) | Full installation guide, prerequisites, intiface-engine setup, systemd service |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, data flow, component hierarchy, state management |
| [docs/DEVICE_GUIDE.md](docs/DEVICE_GUIDE.md) | Pairing instructions, BLE scanning tips, reconnection workflow |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Project structure, available scripts, adding features, the patch system |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Connection issues, device not found, controls not responding, Vite cache |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌─────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  React  │  │  Web Audio  │  │   ButtplugClient (WS)   │ │
│  │   App   │  │     API     │  │  buttplug npm (patched) │ │
│  └────┬────┘  └─────────────┘  └───────────┬─────────────┘ │
│       │                                     │               │
│       └─────────────────────────────────────┘               │
│                         │                                   │
│                    WebSocket                                │
└─────────────────────────┬───────────────────────────────────┘
                          │ port 12345
┌─────────────────────────┼───────────────────────────────────┐
│                    intiface-engine                          │
│              (Rust, WebSocket server)                       │
│                         │                                   │
│                    BlueZ / BLE                              │
└─────────────────────────┼───────────────────────────────────┘
                          │ BLE
┌─────────────────────────┼───────────────────────────────────┐
│                 Intimate Device                             │
│            (e.g., Libo Miao LB-W01)                         │
└─────────────────────────────────────────────────────────────┘
```

The app uses a **hook-based architecture** with three primary custom hooks:

- `useButtplug` -- WebSocket connection, device scanning, state sync
- `useWaveform` -- Pattern storage, playback timing, canvas rendering
- `useAudioAnalysis` -- Audio decoding, waveform analysis, playback

Read the full architecture guide in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Critical Technical Notes

### Buttplug Spec V4 Compatibility Bug

The `buttplug` npm package v4.0.2 sends `Value: [10]` (array) in `OutputCmd` messages, but `intiface-engine` v4.0.2 strictly requires a scalar `Value: 10`. This project includes an automatic patch (via `patch-package`) that fixes this at install time.

**Do not run `npm install` without the patch being present.** If you manually modify dependencies, clear the Vite cache afterward:

```bash
rm -rf node_modules/.vite
npm run dev
```

### BLE Device Behavior

Some BLE devices (e.g., "Libo Miao" / LB-W01) have aggressive power-saving:

- Only advertise for 35--45 seconds after entering pairing mode
- BLE negotiation takes approximately 13 seconds
- Must press the device button to re-enter pairing mode after disconnect

Plan your workflow accordingly -- enter pairing mode just before clicking **Scan Devices**.

---

## Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome / Edge | Full support | Recommended |
| Firefox | Full support | May require user interaction to start `AudioContext` |
| Safari | Not tested | -- |
| Mobile Chrome (Android) | Supported | -- |
| Mobile Firefox (Android) | Supported | -- |

---

## Tech Stack

- **React 19** + **TypeScript** ~5.9
- **Vite 7** (build tool and dev server)
- **Tailwind CSS 3** + **shadcn/ui** (styling and 40+ UI primitives)
- **Buttplug.js 4.0.2** (device protocol, patched)
- **Web Audio API** (audio analysis and playback)
- **WebSocket** (Intiface communication)
- **Lucide React** (icons)

---

## Development

### Available Scripts

```bash
npm run dev       # Start Vite dev server (port 3000)
npm run build     # TypeScript check + production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Project Structure

```
app/
├── src/
│   ├── hooks/
│   │   ├── useButtplug.ts         # Buttplug.io WebSocket integration
│   │   ├── useWaveform.ts         # Waveform pattern engine
│   │   └── useAudioAnalysis.ts    # Audio file analysis and playback
│   ├── components/
│   │   ├── DevicePanel.tsx        # Connection and device list UI
│   │   ├── ManualControlPanel.tsx # Device control sliders (individual + master)
│   │   ├── WaveformPanel.tsx      # Pattern editor and player UI
│   │   ├── AudioPanel.tsx         # Audio upload and playback UI
│   │   ├── WaveformPlayer.tsx     # Pattern-to-device output bridge (invisible)
│   │   ├── AudioPlayer.tsx        # Audio-to-device output bridge (invisible)
│   │   ├── Layout.tsx             # App shell with navigation sidebar
│   │   ├── GuidePanel.tsx         # In-app getting started guide
│   │   └── ui/                    # shadcn/ui components (40+ primitives)
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── pages/
│   │   └── Home.tsx               # Main page with tab routing
│   ├── App.tsx                    # Root React component
│   └── main.tsx                   # Entry point
├── patches/
│   └── buttplug+4.0.2.patch       # Critical patch for buttplug library
├── docs/                          # Documentation
├── public/                        # Static assets
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

For full development details, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

---

## Known Limitations

- Device disconnection handling is passive (relies on server-sent `DeviceList` updates or 2-second polling during scans)
- No device battery level display (`intiface-engine` does not expose this reliably for all devices)
- Audio analysis is basic RMS average per bin -- no frequency-domain analysis (FFT)
- Waveform patterns use linear interpolation between control points
- Pattern and audio data are not persisted across page reloads

---

## License

MIT

## Acknowledgments

- [Buttplug.io](https://buttplug.io/) -- The protocol and Intiface ecosystem
- [Nonpolynomial Labs](https://nonpolynomial.com/) -- Creators of Buttplug
