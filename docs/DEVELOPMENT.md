# Development Guide

Guide for developers who want to understand, modify, or extend the Sex Controller application.

---

## Project Structure

```
pleasure-control/app/
├── src/
│   ├── hooks/                    # Custom React hooks (core business logic)
│   │   ├── useButtplug.ts        # Buttplug.io WebSocket client integration
│   │   ├── useWaveform.ts        # Waveform pattern engine and playback
│   │   └── useAudioAnalysis.ts   # Audio file analysis and Web Audio API
│   │
│   ├── components/               # React components
│   │   ├── DevicePanel.tsx       # Connection status and device list UI
│   │   ├── ManualControlPanel.tsx # Per-device sliders + master control
│   │   ├── WaveformPanel.tsx     # Pattern editor with canvas-based UI
│   │   ├── AudioPanel.tsx        # Audio upload, waveform display, playback
│   │   ├── WaveformPlayer.tsx    # Invisible bridge: patterns → devices
│   │   ├── AudioPlayer.tsx       # Invisible bridge: audio → devices
│   │   ├── Layout.tsx            # App shell with responsive navigation
│   │   ├── GuidePanel.tsx        # In-app help and troubleshooting guide
│   │   └── ui/                   # shadcn/ui components (40+ primitives)
│   │       ├── button.tsx
│   │       ├── slider.tsx
│   │       ├── card.tsx
│   │       └── ... (see full list in components/ui/)
│   │
│   ├── types/
│   │   └── index.ts              # Shared TypeScript interfaces and types
│   │
│   ├── pages/
│   │   └── Home.tsx              # Main page: tab routing, hook composition
│   │
│   ├── App.tsx                   # Root component with React Router
│   ├── main.tsx                  # Entry point: React root creation
│   ├── index.css                 # Tailwind directives + CSS variables (light/dark)
│   └── App.css                   # App-specific styles (minimal)
│
├── patches/
│   └── buttplug+4.0.2.patch      # Critical patch for buttplug library bug
│
├── docs/                         # Documentation
├── public/                       # Static assets
├── index.html                    # HTML entry point
├── package.json                  # Dependencies and scripts
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind CSS theme and colors
├── tsconfig.json                 # TypeScript configuration
└── eslint.config.js              # ESLint configuration
```

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start Vite development server on port 3000 |
| `build` | `npm run build` | Run TypeScript compiler + Vite production build |
| `lint` | `npm run lint` | Run ESLint across the entire project |
| `preview` | `npm run preview` | Preview the production build locally |
| `postinstall` | `npm install` | Automatically applied: runs `patch-package` |

### Development Workflow

```bash
# Terminal 1: intiface-engine
intiface-engine --websocket-port 12345 --websocket-use-all-interfaces --use-bluetooth-le --log info

# Terminal 2: development server
npm run dev

# Open http://localhost:3000 in browser
```

---

## Tech Stack Deep Dive

### React 19 + TypeScript

- Uses **React StrictMode** in development
- **Functional components** with hooks only -- no class components
- **TypeScript ~5.9** with strict mode
- Path aliasing: `@/` maps to `src/` via Vite resolve config

### Vite 7

Key configuration (`vite.config.ts`):

```typescript
export default defineConfig({
  base: './',           // Relative paths for portable builds
  plugins: [
    inspectAttr(),      // kimi-plugin-inspect-react (development only)
    react(),            // @vitejs/plugin-react
  ],
  server: { port: 3000 },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Important:** `base: './'` means the production build uses relative paths, allowing the app to be served from any subdirectory.

### Tailwind CSS 3 + shadcn/ui

- Tailwind configured with CSS variables for theming
- Supports **light and dark modes** via `dark` class
- shadcn/ui provides 40+ accessible UI primitives built on Radix UI
- Custom color tokens: `primary`, `secondary`, `muted`, `accent`, `destructive`, etc.

### Buttplug.js 4.0.2 (Patched)

The `buttplug` package is the official JavaScript client for the Buttplug protocol. See [The Patch System Explained](#the-patch-system-explained) below for critical compatibility information.

---

## Adding New Features

### Adding a New Control Tab

To add a new feature tab (e.g., "Scripts" or "Games"):

1. **Add tab type to `src/types/index.ts`:**
   ```typescript
   export type TabType = 'devices' | 'manual' | 'waveform' | 'audio' | 'guide' | 'scripts';
   ```

2. **Add tab configuration to `Layout.tsx`:**
   ```typescript
   const tabs = [
     // ... existing tabs
     { id: 'scripts' as TabType, label: 'Scripts', icon: FileCode },
   ];
   ```

3. **Create the new hook (`src/hooks/useScripts.ts`):**
   ```typescript
   export function useScripts() {
     // Your feature logic here
     return { /* state and handlers */ };
   }
   ```

4. **Create the panel component (`src/components/ScriptsPanel.tsx`):**
   ```typescript
   export function ScriptsPanel({ /* props */ }) {
     // Your UI here
   }
   ```

5. **Wire into `Home.tsx`:**
   ```typescript
   const scripts = useScripts();
   
   // In renderTab():
   case 'scripts':
     return <ScriptsPanel {...scripts} />;
   ```

### Adding a New Waveform Pattern

Built-in patterns are defined in `useWaveform.ts`:

```typescript
const DEFAULT_PATTERNS: WaveformPattern[] = [
  // Add your pattern here
  {
    id: 'my-pattern',
    name: 'My Custom Pattern',
    duration: 5,
    loop: true,
    points: Array.from({ length: 50 }, (_, i) => ({
      time: i / 49,
      intensity: /* your math here */,
    })),
  },
];
```

Pattern requirements:
- `id`: Unique string identifier
- `name`: Human-readable name
- `duration`: Length in seconds
- `loop`: Whether to repeat
- `points`: Array of `{ time: number (0-1), intensity: number (0-1) }`

Points must be sorted by `time` (ascending). The first point should have `time: 0` and the last `time: 1`.

### Adding Device Capability Support

Currently supported capabilities: Vibrate, Rotate, Oscillate.

To add a new capability (e.g., "Constrict"):

1. **Update types in `src/types/index.ts`:**
   ```typescript
   export interface DeviceState {
     // ... existing fields
     constrictIntensity: number;  // Already present
     // Add new fields here
   }
   ```

2. **Update `useButtplug.ts` `syncDevices`:**
   ```typescript
   // Initialize new capability state when device is added
   next.set(index, {
     // ...
     constrictIntensity: 0,
   });
   ```

3. **Add slider in `ManualControlPanel.tsx`:**
   ```typescript
   const sendConstrict = useCallback(async (device, intensity) => {
     if (!device.hasOutput('Constrict' as any)) return;
     await device.runOutput(DeviceOutput.Constrict.percent(intensity));
   }, []);
   ```

4. **Update `WaveformPlayer.tsx` and `AudioPlayer.tsx`** to send the new capability:
   ```typescript
   if (device.hasOutput('Constrict' as any)) {
     device.runOutput(DeviceOutput.Constrict.percent(intensity)).catch(() => {});
   }
   ```

---

## Testing with Real Devices

### Development Testing Workflow

1. **Start intiface-engine** in one terminal with debug logging:
   ```bash
   intiface-engine --websocket-port 12345 --websocket-use-all-interfaces --use-bluetooth-le --log debug
   ```

2. **Start the dev server** in another terminal:
   ```bash
   npm run dev
   ```

3. **Open browser** at `http://localhost:3000`

4. **Browser DevTools**: Keep the console open to see Buttplug debug messages:
   ```
   [Buttplug] Device added: Libo Miao index: 0
   [Buttplug] Connection error: Failed to connect to Intiface server...
   [Ctrl] Device has no Rotate output, skipping
   ```

### Testing Without a Physical Device

Unfortunately, there is no official Buttplug device simulator. For UI development without hardware:

1. Connect to intiface-engine (it will show 0 devices)
2. UI components handle empty states gracefully
3. You can test waveform and audio panels without devices -- the bridge components (`WaveformPlayer`, `AudioPlayer`) simply have no devices to send to

### Testing the Audio Pipeline

You can test audio analysis without a connected device:

1. Go to the **Audio** tab
2. Upload any MP3, WAV, or OGG file
3. The waveform visualization renders immediately
4. Click **Play** to hear audio and see the live intensity bar
5. The `AudioPlayer` component attempts to send to devices but silently fails if none are connected (`.catch(() => {})`)

---

## The Patch System Explained

### The Problem

The `buttplug` npm package v4.0.2 has a bug in `ButtplugClientDeviceFeature.js` where it constructs `OutputCmd` messages with an array value:

```javascript
// Line 98 (BEFORE patch)
let newCommand = { Value: [value], Duration: duration };
```

But `intiface-engine` v4.0.2 expects a scalar value per the Buttplug Protocol V4 specification:

```javascript
// Line 98 (AFTER patch)
let newCommand = { Value: value, Duration: duration };
```

If unpatched, every device command fails with a schema validation error from intiface-engine.

### How the Patch Works

The patch file is at `patches/buttplug+4.0.2.patch`:

```diff
--- a/node_modules/buttplug/dist/main/client/ButtplugClientDeviceFeature.js
+++ b/node_modules/buttplug/dist/main/client/ButtplugClientDeviceFeature.js
@@ -95,7 +95,7 @@ class ButtplugClientDeviceFeature {
          else {
              value = Math.ceil(this._feature.Output[type].Value[1] * p.percent);
          }
-        let newCommand = { Value: [value], Duration: duration };
+        let newCommand = { Value: value, Duration: duration };
          let outCommand = {};
          outCommand[type.toString()] = newCommand;
          let cmd = {
```

### Automatic Application

The `postinstall` script in `package.json` automatically runs `patch-package` after `npm install`:

```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

### Vite Cache Interaction

Vite pre-bundles dependencies into `node_modules/.vite/`. If the patch is applied **after** Vite has already cached the unpatched version, the cached code (without the fix) will be used.

**Always clear the Vite cache after any patch modification:**

```bash
rm -rf node_modules/.vite
npm run dev
```

### Regenerating the Patch

If you upgrade the `buttplug` package or modify the patched file directly:

1. Make your changes in `node_modules/buttplug/...`
2. Run:
   ```bash
   npx patch-package buttplug
   ```
3. This updates `patches/buttplug+4.0.2.patch`
4. Commit the updated patch file

### Verifying the Patch is Applied

After `npm install`, verify:

```bash
# Check the patched file
grep "Value: value" node_modules/buttplug/dist/main/client/ButtplugClientDeviceFeature.js

# Should output:
# let newCommand = { Value: value, Duration: duration };
```

If it still shows `[value]`, the patch failed to apply.

### When the Patch Might Fail

- `buttplug` version mismatch (patch targets exactly 4.0.2)
- `node_modules` corrupted or partially installed
- `patch-package` not installed (should be in `devDependencies`)

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Code Style and Conventions

### File Naming

- Components: `PascalCase.tsx` (e.g., `DevicePanel.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useButtplug.ts`)
- Types: `camelCase.ts` (e.g., `index.ts`)
- Utilities: `camelCase.ts` (e.g., `utils.ts`)

### Component Patterns

- Use function declarations for components:
  ```typescript
  export function DevicePanel({ ... }) { ... }
  ```

- Destructure props at the parameter level
- Use `React.ElementType` for icon props
- Prefer `useCallback` for handlers passed to children

### Type Safety

- Always type hook return values
- Use `Partial<T>` for update functions
- Avoid `any` except for Buttplug library workarounds (the library has incomplete types)

### Error Handling

- Buttplug errors are caught and logged to console:
  ```typescript
  try {
    await device.runOutput(...);
  } catch (e) {
    console.error('[Ctrl] Vibrate error:', e);
  }
  ```

- Async errors in effects use `.catch(() => {})` for fire-and-forget operations
- User-facing errors are stored in state and displayed as alert banners

---

## Build and Deployment

### Production Build

```bash
npm run build
```

Output is in `dist/`:
- `index.html`
- `assets/index-*.js` (bundled JavaScript)
- `assets/index-*.css` (bundled CSS)

### Static Hosting

The app is a static SPA. Serve `dist/` with any web server:

```bash
# Python
python3 -m http.server 8080 --directory dist

# Node.js
npx serve dist

# nginx
# See SETUP.md for nginx configuration
```

### Environment Variables

The app does not use environment variables. The WebSocket URL is constructed at runtime:

```typescript
const WS_URL = `ws://${window.location.hostname}:12345`;
```

This allows the app to work regardless of which host it is served from, as long as intiface-engine is running on the same host.

---

## Useful Debug Commands

```bash
# Check intiface-engine status
sudo systemctl status intiface-engine

# View intiface-engine logs
sudo journalctl -u intiface-engine -f

# Check if port 12345 is open
ss -tlnp | grep 12345

# List connected Bluetooth devices
bluetoothctl devices

# Monitor Bluetooth traffic (requires root)
sudo btmon

# Check Vite build output
npm run build
ls -la dist/
```

---

## Contributing Guidelines

1. **Follow existing patterns** -- hooks for logic, components for UI
2. **Add types** for any new data structures
3. **Handle errors** -- never let unhandled promise rejections crash the UI
4. **Test with real devices** when modifying device communication code
5. **Update documentation** when adding features or changing behavior
6. **Clear Vite cache** if you modify patches or node_modules
