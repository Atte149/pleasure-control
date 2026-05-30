# Setup Guide

Complete installation instructions for the Sex Controller application on Linux.

---

## Prerequisites

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| OS | Linux with systemd | Ubuntu 22.04+, Fedora 38+, Arch |
| Node.js | 20.x LTS | 22.x LTS |
| Bluetooth | BlueZ 5.x with BLE support | Built-in or USB 4.0 adapter |
| RAM | 2 GB | 4 GB |
| Storage | 500 MB | 1 GB |

### Required Software

1. **Node.js 20+** -- [nodejs.org](https://nodejs.org/)
2. **npm** (bundled with Node.js) or **pnpm**
3. **Rust toolchain** (for building intiface-engine from source) or a pre-built binary
4. **BlueZ** -- Linux Bluetooth protocol stack (usually pre-installed)

### Bluetooth Requirements

Your system must have a Bluetooth adapter that supports **Bluetooth Low Energy (BLE)**.

Verify BLE support:

```bash
# Check if Bluetooth is available
hciconfig

# Or with newer tools
bluetoothctl show

# Look for "Powered: yes" and "Discoverable: yes"
```

If you see `No default controller available`, your Bluetooth adapter may be disabled or missing.

---

## Step-by-Step Installation

### 1. Install Node.js

**Using NodeSource (Ubuntu/Debian):**

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Using NVM (any distro):**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
```

**Verify:**

```bash
node --version   # Should print v22.x.x
npm --version    # Should print 10.x.x
```

### 2. Install Rust (for intiface-engine)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**Verify:**

```bash
rustc --version
cargo --version
```

### 3. Install intiface-engine

**Option A: Install from crates.io (recommended)**

```bash
cargo install intiface-engine
```

This downloads and compiles the latest stable version. Compilation may take 5--15 minutes depending on your CPU.

**Option B: Download pre-built binary**

Visit [github.com/intiface/intiface-engine/releases](https://github.com/intiface/intiface-engine/releases) and download the appropriate binary for your architecture.

```bash
# Example for x86_64 Linux
wget https://github.com/intiface/intiface-engine/releases/download/v4.0.2/intiface-engine-linux-x86_64
chmod +x intiface-engine-linux-x86_64
sudo mv intiface-engine-linux-x86_64 /usr/local/bin/intiface-engine
```

**Verify:**

```bash
intiface-engine --version
```

### 4. Clone the Application

```bash
git clone <repository-url>
cd sex_controller/app
```

### 5. Install Dependencies

```bash
npm install
```

This will:
1. Download all npm dependencies
2. Automatically apply the `buttplug` patch via `patch-package`

You should see output like:

```
> my-app@0.0.0 postinstall
> patch-package

patch-package 8.0.1
Applying patches...
buttplug@4.0.2 ✓
```

### 6. Start the Development Server

```bash
npm run dev
```

The Vite dev server starts on `http://localhost:3000`.

---

## intiface-engine Configuration

### Basic Usage

Run intiface-engine directly:

```bash
intiface-engine \
  --websocket-port 12345 \
  --websocket-use-all-interfaces \
  --use-bluetooth-le \
  --log info
```

**Flag explanations:**

| Flag | Purpose |
|------|---------|
| `--websocket-port 12345` | WebSocket server listens on port 12345 |
| `--websocket-use-all-interfaces` | Accept connections from any IP (not just localhost) |
| `--use-bluetooth-le` | Enable Bluetooth Low Energy scanning |
| `--log info` | Show informational output (use `debug` for verbose) |

### Checking Server Status

```bash
# Check if port 12345 is listening
ss -tlnp | grep 12345

# Or with netstat
netstat -tlnp | grep 12345

# Expected output:
# LISTEN 0 128 0.0.0.0:12345 ...
```

---

## systemd Service Setup

For a production or always-on setup, run intiface-engine as a systemd service.

### 1. Create Service File

Create `/etc/systemd/system/intiface-engine.service`:

```ini
[Unit]
Description=Intiface Engine - Buttplug Protocol Server
After=bluetooth.service network.target
Wants=bluetooth.service

[Service]
Type=simple
User=%I
ExecStart=/home/YOUR_USER/.cargo/bin/intiface-engine \
  --websocket-port 12345 \
  --websocket-use-all-interfaces \
  --use-bluetooth-le \
  --log info
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

**Replace `YOUR_USER`** with your actual Linux username.

### 2. Reload systemd and Enable Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now intiface-engine
```

### 3. Verify Service Status

```bash
sudo systemctl status intiface-engine
```

You should see `Active: active (running)`.

### 4. View Logs

```bash
# Real-time logs
sudo journalctl -u intiface-engine -f

# Last 50 lines
sudo journalctl -u intiface-engine -n 50
```

### 5. Common Service Commands

```bash
sudo systemctl start intiface-engine    # Start
sudo systemctl stop intiface-engine     # Stop
sudo systemctl restart intiface-engine  # Restart
sudo systemctl disable intiface-engine  # Disable auto-start
```

---

## Firewall Configuration

If you have a firewall enabled (e.g., `ufw`, `firewalld`, or `iptables`), ensure port 12345 is open for local connections.

### UFW (Ubuntu/Debian)

```bash
sudo ufw allow 12345/tcp
```

### firewalld (Fedora/RHEL)

```bash
sudo firewall-cmd --permanent --add-port=12345/tcp
sudo firewall-cmd --reload
```

### iptables

```bash
sudo iptables -A INPUT -p tcp --dport 12345 -j ACCEPT
```

---

## Browser Requirements

### Supported Browsers

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 90+ | Full support, recommended |
| Edge | 90+ | Full support |
| Firefox | 90+ | Full support; may require user interaction to start AudioContext |
| Safari | Untested | Not verified |
| Mobile Chrome (Android) | 90+ | Supported |
| Mobile Firefox (Android) | 90+ | Supported |

### Required Browser Features

The application requires the following Web APIs:

- **WebSocket** -- Communication with intiface-engine
- **Web Audio API** -- Audio file decoding and playback
- **Canvas 2D** -- Waveform visualization
- **File API** -- Audio file upload

All modern browsers support these APIs. No Web Bluetooth API is required in the browser -- all BLE operations happen server-side in intiface-engine.

### Firefox-Specific Notes

Firefox requires a user gesture (click) before allowing audio playback. The app handles this by requiring the user to click the **Play** button, which both starts audio and resumes a suspended `AudioContext`.

```typescript
// From useAudioAnalysis.ts
if (ctx.state === 'suspended') {
  ctx.resume();
}
```

---

## Production Build

To build for production deployment:

```bash
npm run build
```

This creates a static site in `dist/` that can be served by any web server:

```bash
# Preview locally
npm run preview

# Serve with nginx, Apache, or any static file server
# The app uses relative paths (base: './' in vite.config.ts)
```

### nginx Configuration Example

```nginx
server {
    listen 80;
    server_name localhost;
    root /var/www/sex-controller/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Verification Checklist

After completing setup, verify each component:

- [ ] Node.js 20+ installed (`node --version`)
- [ ] `npm install` completed without errors
- [ ] Patch applied successfully (check console output)
- [ ] intiface-engine installed and in PATH (`intiface-engine --version`)
- [ ] systemd service active (`systemctl status intiface-engine`)
- [ ] Port 12345 listening (`ss -tlnp | grep 12345`)
- [ ] App loads in browser at `http://localhost:3000`
- [ ] "Connect to Intiface" button shows "Connected" status
- [ ] Bluetooth adapter powered on (`bluetoothctl show`)

---

## Next Steps

Once setup is complete:

1. Read [DEVICE_GUIDE.md](DEVICE_GUIDE.md) to learn how to pair your specific device
2. Read [TROUBLESHOOTING.md](TROUBLESHOOTING.md) if you encounter any issues
3. Read [DEVELOPMENT.md](DEVELOPMENT.md) if you plan to modify the code
