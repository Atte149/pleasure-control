// Intiface/Buttplug server connection settings.
// On web (served from the PC) we default to the page host.
// On Android (Capacitor) window.location.hostname is not the PC, so the user
// must point the app at the PC running Intiface — we persist that choice.

const STORAGE_KEY = 'pleasure-control-server-url';
const DEFAULT_PORT = 12345;

function defaultUrl(): string {
  const host =
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost'
      ? window.location.hostname
      : 'localhost';
  return `ws://${host}:${DEFAULT_PORT}`;
}

export function getServerUrl(): string {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored.trim()) return stored.trim();
  }
  return defaultUrl();
}

export function setServerUrl(url: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, url.trim());
  }
}

// Accepts a bare host, host:port, or full ws:// URL and normalizes to ws://host:port.
export function normalizeServerUrl(input: string): string {
  let value = input.trim();
  if (!value) return defaultUrl();
  if (!/^wss?:\/\//i.test(value)) value = `ws://${value}`;
  // Append default port if none specified after the host.
  try {
    const u = new URL(value);
    if (!u.port) u.port = String(DEFAULT_PORT);
    return `${u.protocol}//${u.hostname}:${u.port}`;
  } catch {
    return value;
  }
}

export { DEFAULT_PORT };
