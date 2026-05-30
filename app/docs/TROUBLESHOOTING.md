# Troubleshooting Guide

Common issues and their solutions when using the Sex Controller application.

---

## Connection Issues

### "Failed to connect to Intiface"

**Symptom:** Clicking "Connect to Intiface" shows a red error banner and the status remains "Disconnected."

**Diagnosis Steps:**

1. **Verify intiface-engine is running:**
   ```bash
   sudo systemctl status intiface-engine
   ```
   If inactive:
   ```bash
   sudo systemctl start intiface-engine
   ```

2. **Check port 12345 is listening:**
   ```bash
   ss -tlnp | grep 12345
   ```
   Expected output:
   ```
   LISTEN 0 128 0.0.0.0:12345 ...
   ```
   If nothing appears, intiface-engine is not started or crashed.

3. **Check firewall rules:**
   ```bash
   sudo ufw status | grep 12345
   # or
   sudo iptables -L | grep 12345
   ```
   If blocked, allow the port (see [SETUP.md](SETUP.md#firewall-configuration)).

4. **Check browser console for WebSocket errors:**
   Open DevTools → Console. Look for:
   ```
   WebSocket connection to 'ws://localhost:12345' failed
   ```

5. **Try restarting intiface-engine:**
   ```bash
   sudo systemctl restart intiface-engine
   sudo journalctl -u intiface-engine -f
   ```

**Common Causes:**

| Cause | Solution |
|-------|----------|
| intiface-engine not running | `sudo systemctl start intiface-engine` |
| Wrong port | Verify `--websocket-port 12345` flag |
| Firewall blocking port 12345 | `sudo ufw allow 12345/tcp` |
| intiface-engine crashed | Check logs: `journalctl -u intiface-engine -n 50` |
| Browser blocking WebSocket | Check extensions (Privacy Badger, uBlock) |

### "WebSocket connection failed" in Browser Console

If you see `ERR_CONNECTION_REFUSED`:
- intiface-engine is not running on the expected port
- You are accessing the app from a different machine and intiface-engine is bound to localhost only
  - Fix: Add `--websocket-use-all-interfaces` flag

If you see `ERR_CONNECTION_TIMED_OUT`:
- Firewall is blocking the port
- The server is overloaded or unresponsive

### Connection Drops Immediately After Connecting

**Symptom:** Status shows "Connected" briefly, then returns to "Disconnected."

**Causes:**

1. **intiface-engine restarted** -- Check server logs
2. **Multiple clients connected** -- Some intiface-engine versions only allow one client
3. **Protocol mismatch** -- Ensure buttplug patch is applied (see [DEVELOPMENT.md](DEVELOPMENT.md#the-patch-system-explained))

**Fix:**
```bash
# Verify patch is applied
grep "Value: value" node_modules/buttplug/dist/main/client/ButtplugClientDeviceFeature.js

# If patch is missing:
rm -rf node_modules/.vite node_modules
npm install
```

---

## Device Not Found

### Scanning Shows "No devices connected"

**Symptom:** Clicking "Scan Devices" runs for 30 seconds but no devices appear.

**Diagnosis Steps:**

1. **Verify device is in pairing mode:**
   - Device LED should be blinking rapidly
   - If LED is solid or off, the device is not discoverable
   - Press and hold the power button to enter pairing mode

2. **Check Bluetooth adapter status:**
   ```bash
   bluetoothctl show
   ```
   Look for:
   ```
   Powered: yes
   Discoverable: no
   Pairable: yes
   ```
   If `Powered: no`:
   ```bash
   bluetoothctl power on
   ```

3. **Move device closer:**
   - Place within 1 meter of the Bluetooth adapter
   - Remove metal objects between device and adapter

4. **Check for interference:**
   - USB 3.0 ports cause severe Bluetooth interference
   - Try a different USB port (preferably USB 2.0)
   - Temporarily disable 2.4 GHz WiFi if possible

5. **Check device battery:**
   - Low battery can prevent advertising
   - Charge the device and retry

6. **Ensure device is not connected elsewhere:**
   - Close manufacturer apps on your phone
   - Disconnect from other computers
   - Some devices can only pair with one host at a time

7. **Restart Bluetooth stack:**
   ```bash
   sudo systemctl restart bluetooth
   sudo systemctl restart intiface-engine
   ```

8. **Check intiface-engine logs for BLE errors:**
   ```bash
   sudo journalctl -u intiface-engine -n 100 | grep -i "error\|fail\|ble"
   ```

### Device Appears Briefly Then Disappears

**Symptom:** Device shows in the list for a few seconds, then vanishes.

**Causes:**

1. **Aggressive power saving** (common with Libo Miao / LB-W01)
   - Device stops advertising after 35--45 seconds
   - BLE negotiation takes ~13 seconds
   - Solution: Re-enter pairing mode and scan again immediately

2. **Unstable Bluetooth connection**
   - Move closer to adapter
   - Check for USB 3.0 interference
   - Try a different Bluetooth adapter

3. **Device firmware bug**
   - Some devices have flaky BLE stacks
   - Check manufacturer for firmware updates

### Device Found but Shows Wrong Name

Buttplug identifies devices by their BLE advertisement name. Some devices report generic names like "LVS-***" or "Unknown Device." This is normal and does not affect functionality.

---

## Controls Not Responding

### Sliders Move But Device Does Nothing

**Symptom:** Moving vibration sliders has no effect on the physical device.

**Diagnosis Steps:**

1. **Check device connection status:**
   - Go to **Devices** tab
   - Verify the device shows "Connected" badge
   - If missing, the device has disconnected -- re-scan

2. **Check capability badges:**
   - In **Manual** tab, look for VIB/ROT/OSC badges on the device card
   - If a capability is missing, the device does not support it
   - Example: Libo Miao only supports Vibrate (no Rotate or Oscillate)

3. **Check browser console for errors:**
   ```
   [Ctrl] Vibrate error: Error: Device disconnected
   [Ctrl] Device has no Vibrate output, skipping
   ```

4. **Try "Stop All" then retry:**
   - Click **Stop All** in Devices tab
   - Wait 2 seconds
   - Try the slider again

5. **Check the buttplug patch:**
   ```bash
   grep "Value: value" node_modules/buttplug/dist/main/client/ButtplugClientDeviceFeature.js
   ```
   If this shows `[value]` instead of `value`, commands are being rejected by the server.
   ```bash
   rm -rf node_modules/.vite node_modules
   npm install
   ```

### Master Control Doesn't Affect All Devices

**Symptom:** Master Control slider only affects some connected devices.

**Cause:** Master Control sends vibration commands to all devices that **support vibration** (have the VIB badge). Devices without vibration capability are skipped.

**Fix:** This is expected behavior. Use individual device sliders for non-vibrating capabilities.

### Waveform Pattern Plays But No Vibration

**Symptom:** Pattern appears to play (progress indicator moves) but device doesn't vibrate.

**Causes:**

1. **No devices connected** during playback start
   - Bridge components (`WaveformPlayer`) only send to connected devices
   - Connect a device before starting playback

2. **Device disconnected during playback**
   - Check Devices tab
   - Reconnect and restart pattern

3. **Intensity too low**
   - Pattern may have very low intensity values
   - Check the pattern preview canvas -- the fill area should be visible

4. **Pattern has flat line at 0**
   - Edit the pattern and verify control points have intensity > 0

### Audio Mode: No Vibration Despite Audio Playing

**Symptom:** Audio plays through speakers but no device vibration.

**Causes:**

1. **No devices connected**
   - Same as waveform issue above

2. **Intensity scale too low**
   - Default intensity scale is 1.0 (100%)
   - If your audio is quiet, increase the scale to 1.5 or 2.0

3. **Audio file is silent or very quiet**
   - The app uses RMS amplitude analysis
   - Silent sections produce 0 intensity
   - Try a different audio file with more dynamic range

4. **Firefox AudioContext suspended**
   - Firefox requires user interaction before audio can play
   - The app handles this automatically, but if you bypass the Play button, audio may not start

---

## Vite Cache Issues

### Changes Not Reflected After Modifying Code

**Symptom:** You edit a source file but the browser shows the old version.

**Fix:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

### Patch Applied But Commands Still Fail

**Symptom:** You verified the patch is in `node_modules/buttplug/...` but device commands are still rejected.

**Cause:** Vite cached the unpatched version before the patch was applied.

**Fix:**
```bash
rm -rf node_modules/.vite
npm run dev
```

### "Cannot find module" After Adding New Files

**Fix:**
```bash
# Restart the dev server (Vite should pick up new files automatically)
# If not:
rm -rf node_modules/.vite
npm run dev
```

---

## Common Error Messages

### `Error: ButtplugHandshakeError`

**Meaning:** The WebSocket connected but the Buttplug protocol handshake failed.

**Causes:**
- Connecting to a non-Buttplug WebSocket endpoint
- Protocol version mismatch
- intiface-engine rejecting the client

**Fix:**
```bash
# Ensure you're connecting to the right port
ss -tlnp | grep 12345

# Restart intiface-engine
sudo systemctl restart intiface-engine
```

### `Error: DeviceNotConnected`

**Meaning:** A command was sent to a device that is no longer connected.

**Fix:**
1. Go to **Devices** tab
2. Verify device is still listed
3. If not, re-enter pairing mode and scan

### `Error: UnknownMessageError` or `SchemaValidationError`

**Meaning:** The server rejected a message due to invalid format.

**Most Common Cause:** The buttplug patch is not applied.

**Fix:**
```bash
grep "Value: value" node_modules/buttplug/dist/main/client/ButtplugClientDeviceFeature.js
# If it shows [value], the patch is missing

rm -rf node_modules/.vite node_modules
npm install
```

### `AudioContext.decodeAudioData error`

**Meaning:** The browser could not decode the uploaded audio file.

**Causes:**
- Corrupted or unsupported file format
- DRM-protected file
- Very large file causing memory issues

**Fix:**
- Use MP3, WAV, or OGG files
- Ensure the file is not DRM-protected
- Try a smaller file (< 50 MB)
- Convert to a different format using an audio converter

### `RangeError: Array buffer allocation failed`

**Meaning:** The audio file is too large to decode in memory.

**Fix:**
- Use shorter audio files (< 10 minutes)
- Close other browser tabs to free memory
- Use lower bitrate files

---

## Performance Issues

### UI Feels Laggy During Pattern Playback

**Causes:**
- Too many devices connected (each receives commands every frame)
- Browser DevTools console open with verbose logging
- Low-powered device (older laptop, mobile)

**Fixes:**
- Close browser DevTools during use
- Disconnect unused devices
- Reduce pattern complexity (fewer control points)

### Audio Playback Stutters

**Causes:**
- High CPU usage from pattern/audio bridge components
- Large audio files
- Browser throttling background tabs

**Fixes:**
- Keep the app tab active and visible
- Use shorter audio files
- Close other CPU-intensive applications

### High CPU Usage

**Expected behavior:** The app uses moderate CPU during active playback because:
- `WaveformPlayer` and `AudioPlayer` run `useEffect` on every state change
- Canvas rendering for waveform visualization
- WebSocket message processing

**To reduce CPU:**
- Stop playback when not needed
- Pause rather than letting patterns loop indefinitely
- Close the browser tab when done

---

## Browser-Specific Issues

### Firefox: "The AudioContext was not allowed to start"

**Symptom:** Audio upload works but clicking Play produces no sound.

**Cause:** Firefox requires a user gesture (click) to resume a suspended `AudioContext`.

**Fix:** The app handles this automatically in `useAudioAnalysis.ts`:
```typescript
if (ctx.state === 'suspended') {
  ctx.resume();
}
```
Always use the app's **Play** button, not browser media controls.

### Chrome: "WebSocket connection failed"

**Symptom:** Connection works in Firefox but fails in Chrome.

**Cause:** Some Chrome extensions block WebSocket connections.

**Fix:** Disable extensions temporarily:
- Privacy Badger
- uBlock Origin (rare, but possible)
- Corporate policy extensions

Test in Incognito mode (Ctrl+Shift+N) with extensions disabled.

### Mobile Browser: Layout Issues

**Symptom:** On mobile, the sidebar doesn't collapse or touch targets are too small.

**Fix:** The app is responsive but optimized for tablets and larger phones. For best experience:
- Use landscape orientation
- Use Chrome or Firefox on Android
- Avoid Safari (untested)

---

## Bluetooth Stack Issues

### "No default controller available"

**Symptom:** `bluetoothctl show` shows no controller.

**Fixes:**
```bash
# Check if Bluetooth service is running
sudo systemctl status bluetooth

# Start if needed
sudo systemctl start bluetooth

# Check for hardware issues
lsusb | grep -i bluetooth
# Should show your Bluetooth adapter

# If using a USB dongle, try a different port
# Avoid USB 3.0 ports (blue plastic inside) -- use USB 2.0 (black/white)
```

### Bluetooth Adapter Disappears After Suspend/Resume

**Fix:**
```bash
sudo systemctl restart bluetooth
sudo systemctl restart intiface-engine
```

---

## Recovery Procedures

### Nuclear Option: Full Reset

If nothing else works, perform a full reset:

```bash
# 1. Stop all services
sudo systemctl stop intiface-engine

# 2. Restart Bluetooth
sudo systemctl restart bluetooth

# 3. Clear Vite cache
rm -rf node_modules/.vite

# 4. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 5. Start intiface-engine
sudo systemctl start intiface-engine

# 6. Start dev server
npm run dev
```

### Quick Checklist

When reporting an issue, check these items first:

- [ ] intiface-engine is running (`systemctl status intiface-engine`)
- [ ] Port 12345 is open (`ss -tlnp | grep 12345`)
- [ ] Bluetooth is powered on (`bluetoothctl show`)
- [ ] Device is in pairing mode (LED blinking)
- [ ] buttplug patch is applied (`grep "Value: value" node_modules/...`)
- [ ] Vite cache is clear (`rm -rf node_modules/.vite`)
- [ ] Browser console shows no critical errors
- [ ] Tried in a different browser
- [ ] Tried restarting intiface-engine and Bluetooth

---

## Getting Help

If you've gone through this guide and still have issues:

1. Check the **Guide** tab in the app for in-app troubleshooting
2. Review browser console logs (F12 → Console)
3. Check intiface-engine logs (`journalctl -u intiface-engine`)
4. Check the [Buttplug.io documentation](https://docs.buttplug.io/)
5. Check the [intiface-engine repository](https://github.com/intiface/intiface-engine)
