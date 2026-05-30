# Device Guide

How to connect, pair, and manage intimate devices via Bluetooth Low Energy (BLE).

---

## Understanding BLE in This Application

The app does **not** use the browser's Web Bluetooth API. Instead, all Bluetooth communication happens server-side through **intiface-engine**, which runs as a separate process on your computer. The browser communicates with intiface-engine via WebSocket (port 12345), and intiface-engine handles BLE scanning, pairing, and GATT communication directly through the Linux BlueZ stack.

This architecture has several advantages:
- No browser compatibility issues with Web Bluetooth
- Full access to all Buttplug-supported devices
- More reliable connection handling
- Works on mobile browsers via the same WebSocket connection

---

## General Pairing Workflow

```
1. Power on your device
        │
        ▼
2. Enter pairing mode (LED blinks)
        │
        ▼
3. Open app → Devices tab → Connect to Intiface
        │
        ▼
4. Click "Scan Devices"
        │
        ▼
5. Wait 10-15 seconds for BLE negotiation
        │
        ▼
6. Device appears in list
        │
        ▼
7. Switch to Manual/Waveform/Audio tab to control
```

---

## Putting Devices in Pairing Mode

Most BLE intimate devices enter pairing mode automatically when powered on. However, the exact method varies by manufacturer.

### Common Methods

| Manufacturer | Pairing Mode Method |
|-------------|---------------------|
| Lovense | Press and hold power button 3--5 seconds until LED blinks |
| We-Vibe | Press and hold both buttons until LED flashes |
| Kiiroo | Power on; device is discoverable for 30 seconds |
| Libo / Miao | Press and hold power button until LED blinks rapidly |
| Generic BLE | Power on; may be discoverable immediately |

### What Pairing Mode Looks Like

When a device is in pairing mode, you will typically see:
- **Rapid blinking LED** (usually blue or white)
- **No vibration or movement** -- the device is waiting for connection
- The device may emit a low-power beep or short vibration when entering pairing mode

### Important: Timing is Critical

Some devices (notably the **Libo Miao / LB-W01**) have aggressive power-saving:

- **Advertising window**: Only 35--45 seconds after entering pairing mode
- **BLE negotiation time**: Approximately 13 seconds from discovery to full connection
- **Effective window**: You have roughly 20--30 seconds to complete the connection before the device stops advertising

**Best practice:** Enter pairing mode on your device *immediately before* clicking **Scan Devices** in the app.

---

## BLE Scanning Tips

### Before Scanning

1. **Ensure intiface-engine is running**
   ```bash
   sudo systemctl status intiface-engine
   ```

2. **Verify Bluetooth is powered on**
   ```bash
   bluetoothctl show
   # Look for "Powered: yes"
   ```

3. **Move the device close to your computer**
   - Ideal distance: within 1 meter
   - Maximum reliable distance: 3--5 meters (varies by device and adapter)

4. **Remove obstructions**
   - Metal surfaces, water, and thick walls can block BLE signals
   - USB 3.0 ports can cause Bluetooth interference -- use USB 2.0 if possible

### During Scanning

1. **The scan runs for 30 seconds** (auto-timeout)
2. **Keep the device in pairing mode** for the entire scan duration
3. **Do not interact with the device** -- buttons, movement, or covering the device may interrupt pairing
4. **Only one app can scan at a time** -- close other apps that use Bluetooth (including the official manufacturer apps)

### After Scanning

- If the device appears: you're ready to control it
- If the device does not appear: see the troubleshooting section below

---

## Device Auto-Disconnect Behavior

### Why Devices Disconnect

BLE devices disconnect for several reasons:

| Cause | Description |
|-------|-------------|
| **Inactivity timeout** | Device sleeps after 30--60 seconds of no commands |
| **Power saving** | Aggressive firmware powers down the radio |
| **Out of range** | Signal too weak to maintain connection |
| **Battery low** | Device shuts down to preserve power |
| **Server restart** | intiface-engine restart drops all connections |
| **Browser refresh** | Page reload does not disconnect devices, but UI state resets |

### Disconnection Symptoms

In the app, you may notice:
- Sliders move but device does not respond
- Device disappears from the Connected Devices list
- "Stop All" has no effect
- Console shows Buttplug errors

### Reconnection Workflow

When a device disconnects, you must re-establish the connection:

```
Device disconnected
        │
        ▼
Click "Stop All" (clears stale state)
        │
        ▼
Press device button to re-enter pairing mode
        │
        ▼
Click "Scan Devices" again
        │
        ▼
Wait for device to reappear
        │
        ▼
Resume control
```

**Important:** You do **not** need to disconnect from Intiface or restart the app. Simply re-scan while the device is in pairing mode.

---

## Per-Device Notes

### Libo Miao (LB-W01)

The LB-W01 is a budget BLE device with specific quirks.

**Pairing:**
- Press and hold the power button for 3 seconds
- LED blinks rapidly (blue/white) when in pairing mode
- Device advertises for approximately 40 seconds

**Connection Behavior:**
- BLE negotiation takes ~13 seconds
- Device may appear in the list briefly, then disappear, then reappear -- this is normal
- Wait for the "Connected" badge before switching to control tabs

**Power Saving:**
- Very aggressive: disconnects after ~30 seconds of inactivity
- Must press button and re-scan to reconnect
- Battery life is approximately 45--60 minutes of active use

**Capabilities:**
- Vibrate: Yes (primary motor)
- Rotate: No
- Oscillate: No

### Lovense Devices

Lovense toys generally have reliable BLE stacks and good battery life.

**Pairing:**
- Power on; most models are discoverable immediately
- Some older models require holding the power button for 5 seconds

**Connection Behavior:**
- Fast connection (3--5 seconds)
- Stable connection with good range
- Supports vibration patterns natively (but app patterns override these)

**Capabilities:**
- Vibrate: Yes
- Rotate: Some models (e.g., Nora)
- Oscillate: Some models

### We-Vibe Devices

We-Vibe products use a proprietary protocol wrapped in Buttplug.

**Pairing:**
- Press and hold both control buttons simultaneously
- LED flashes when in pairing mode

**Connection Behavior:**
- Moderate connection time (5--8 seconds)
- Good stability

**Capabilities:**
- Vibrate: Yes (dual motors on some models)
- Rotate: No
- Oscillate: No

---

## Multi-Device Setup

You can connect multiple devices simultaneously.

### Supported Combinations

The app supports any combination of Buttplug-compatible devices. Common setups:

| Setup | Use Case |
|-------|----------|
| Single device | Direct manual or pattern control |
| Multiple identical devices | Synchronized patterns |
| Multiple different devices | Independent control per device |

### Master Control

The **Manual** tab has a **Master Control** sub-tab that sends the same vibration intensity to **all** connected devices that support vibration. This is useful for:
- Quick testing of all connected devices
- Synchronized experiences with multiple toys
- Emergency stop (set to 0%)

### Device Selection

Individual device cards in the **Manual** tab show capability badges:
- **VIB** -- Supports vibration
- **ROT** -- Supports rotation
- **OSC** -- Supports oscillation

Sliders are only shown for capabilities the device actually supports.

---

## Range and Interference

### Bluetooth Range

| Environment | Typical Range |
|-------------|---------------|
| Open space | 10--15 meters |
| Same room | 5--8 meters |
| Through one wall | 3--5 meters |
| Through multiple walls | 1--2 meters (unreliable) |

### Interference Sources

| Source | Impact | Mitigation |
|--------|--------|------------|
| USB 3.0 ports | Severe | Use USB 2.0 extension cable, move adapter away |
| 2.4 GHz WiFi | Moderate | Use 5 GHz WiFi if possible |
| Microwave ovens | Severe (when running) | Avoid using during BLE scans |
| Other BLE devices | Low | Generally not an issue |
| Metal surfaces | Moderate | Keep line-of-sight where possible |

---

## Battery Management

### Checking Battery Level

**Unfortunately, battery level reporting is not reliably exposed by intiface-engine for all devices.** The app does not currently display battery levels because:

1. The Buttplug protocol V4 battery message is not consistently implemented across device firmware
2. Some devices report battery only at connection time
3. Battery messages may be dropped by intiface-engine for certain device types

### Best Practices

- Charge devices before use (most devices take 1--2 hours for a full charge)
- If a device disconnects unexpectedly, low battery is a common cause
- Some devices flash red LED when battery is low
- Plan for 45--90 minutes of active use per charge (varies by device and intensity)

---

## Security and Privacy

### BLE Security

BLE connections use encryption, but the security model varies:

- **Just Works pairing**: No PIN required (most intimate devices use this)
- **Passkey pairing**: Rare for this category of device
- **No bonding**: Most devices do not store pairing keys -- you must re-pair each session

### Local-Only Operation

All communication is local:
- Browser ↔ intiface-engine: WebSocket on localhost
- intiface-engine ↔ device: BLE direct connection
- **No cloud services, no data leaves your computer**

### Device Isolation

If you share a computer or Bluetooth adapter, note that:
- Previously paired devices may auto-reconnect to intiface-engine
- You can clear the Bluetooth cache if needed:
  ```bash
  sudo systemctl restart bluetooth
  ```

---

## Troubleshooting Device Connection

### Device Not Found During Scan

1. Verify device is powered on and LED is blinking
2. Move device closer to computer (within 1 meter)
3. Check Bluetooth adapter: `bluetoothctl show` → `Powered: yes`
4. Restart intiface-engine: `sudo systemctl restart intiface-engine`
5. Clear Bluetooth cache: `sudo systemctl restart bluetooth`
6. Check device battery (charge if low)
7. Ensure no other app is using the device
8. Try a different USB port for your Bluetooth adapter (avoid USB 3.0)

### Device Appears But Disconnects Immediately

1. Check device battery level
2. Ensure device remains in pairing mode during the full scan
3. Move closer to the Bluetooth adapter
4. Check for USB 3.0 interference
5. Some devices require firmware updates -- check manufacturer website

### Device Connects But Controls Don't Work

1. Check capability badges (VIB/ROT/OSC) on the device card
2. Verify the device supports the action you're trying (not all devices support all capabilities)
3. Try the **Master Control** tab to test basic vibration
4. Check browser console for Buttplug errors
5. Ensure the buttplug patch is applied (see [DEVELOPMENT.md](DEVELOPMENT.md))

---

## Quick Reference

| Action | Steps |
|--------|-------|
| **Pair new device** | Power on → enter pairing mode → click Scan Devices → wait 10-15s |
| **Reconnect disconnected device** | Press device button → click Scan Devices |
| **Disconnect all devices** | Click "Disconnect" or stop intiface-engine |
| **Stop all vibrations** | Click "Stop All" button |
| **Check connection** | Look for green "Connected" badge in Devices tab |
| **Clear errors** | Click "Dismiss" on error banners |
