# Pleasure Control

A modern, privacy-focused web application for controlling intimate devices via the Buttplug.io protocol. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

### Device Management
- **Universal Compatibility** - Works with any Buttplug.io compatible device
- **Real-time Control** - Instant response with WebSocket communication
- **Battery Monitoring** - Track device battery levels with visual indicators
- **Signal Strength** - Monitor Bluetooth connection quality (RSSI)

### Control Modes

#### Manual Control
- Individual motor control with responsive sliders
- Real-time visual feedback
- Multi-device support

#### Pattern Library
- **10 Pre-built Patterns** - Wave, Pulse, Earthquake, Heartbeat, and more
- **Pattern Categories** - Gentle, Intense, Rhythmic, Random
- **Custom Pattern Editor** - Create and save your own patterns with visual waveform editor
- **Pattern Sharing** - Export/import patterns as JSON

#### Advanced Modes
- **Surprise Me** - Random pattern rotation with configurable intervals
- **Edge Mode** - Automated build-up, hold, and cooldown cycles
- **Sync Mode** - Synchronize multiple devices

#### Game Mode
Five interactive mini-games for playful experiences:
- **Pleasure Roulette** - Spin for random intensity
- **Dice Roll** - Roll 1-6 for intensity levels
- **Card Draw** - Draw cards for different patterns
- **Timer Challenge** - Maintain intensity for set duration
- **Progressive Mode** - Gradual intensity increase

#### Audio Reactive
- Real-time audio analysis from microphone
- Frequency-based intensity mapping
- Customizable sensitivity and smoothing

### Personalization

#### Themes
- Dark/Light mode toggle
- 6 accent color themes (Purple, Pink, Blue, Green, Orange, Red)
- Smooth theme transitions

#### Safety & Preferences
- Maximum intensity limits (30-100%)
- Default intensity settings
- Auto-stop timeout (5-60 minutes)
- Haptic feedback toggle

#### Statistics
- Usage tracking (sessions, total time)
- Top patterns, modes, and games
- Export/import settings and data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- [Intiface Central](https://intiface.com/central/) or [Intiface Engine](https://github.com/intiface/intiface-engine) running on port 12345
- A Buttplug.io compatible device

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pleasure-control.git
cd pleasure-control

# Install dependencies
cd app
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

### Building for Production

```bash
cd app
npm run build
```

The built files will be in `app/dist/`

## 📖 Usage

1. **Start Intiface Central/Engine** - Ensure it's running on port 12345 (default)
2. **Open the App** - Navigate to the application in your browser
3. **Connect** - Go to the Devices tab and click "Connect to Intiface"
4. **Scan** - Click "Scan Devices" to discover your device
5. **Control** - Use any of the control modes to interact with your device

### Configuration

The Intiface server address can be configured in the app:
- Default: `ws://localhost:12345`
- For LAN access: Use your computer's IP address
- For Android: Use `ws://10.0.2.2:12345` (emulator) or your computer's LAN IP

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Device Control**: Buttplug.io v4.0.2
- **Build Tool**: Vite 7
- **State Management**: React Hooks
- **Storage**: localStorage (all data stays on your device)

## 🔒 Privacy & Security

- **100% Local** - All data stored locally in your browser
- **No Analytics** - No tracking or data collection
- **No Server** - Direct device communication via Buttplug.io
- **Open Source** - Full transparency, audit the code yourself

## 📱 Mobile Support

The app works on mobile browsers that support WebBluetooth. For Android, you can also build a native APK:

```bash
cd app
npm run android:apk
```

See [docs/ANDROID.md](docs/ANDROID.md) for detailed Android build instructions.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development

```bash
# Run development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Buttplug.io](https://buttplug.io/) - The amazing protocol and libraries that make this possible
- [Intiface](https://intiface.com/) - Device connectivity software
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- The open source community

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) - Technical architecture overview
- [Development Guide](docs/DEVELOPMENT.md) - Development setup and guidelines
- [Device Guide](docs/DEVICE_GUIDE.md) - Supported devices and troubleshooting
- [Android Build](docs/ANDROID.md) - Building for Android
- [Changelog](CHANGELOG.md) - Version history

## ⚠️ Disclaimer

This software is provided as-is for educational and personal use. Always use intimate devices safely and responsibly. Follow manufacturer guidelines and never exceed safe intensity levels.

## 🐛 Known Limitations

- Requires Intiface Central/Engine to be running
- WebBluetooth may not work in all browsers (Chrome/Edge recommended)
- Some devices don't support battery monitoring
- Audio reactive mode requires microphone permission

## 💬 Support

For issues, questions, or suggestions:
- Open an [issue](https://github.com/yourusername/pleasure-control/issues)
- Check existing [documentation](docs/)
- Review [troubleshooting guide](docs/TROUBLESHOOTING.md)

---

Made with ❤️ for the intimate tech community
