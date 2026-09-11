/**
 * LIFF On-Screen Diagnostics Logger for Word Buddy
 * Persists logs in sessionStorage across Android WebView process reloads
 */

const STORAGE_KEY = 'wb_liff_debug_logs';
const MAX_LOGS = 50;

type LogListener = (logs: string[]) => void;
const listeners: Set<LogListener> = new Set();

const getTimestamp = () => {
  const now = new Date();
  return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
};

export const getLiffLogs = (): string[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addLiffLog = (message: string) => {
  const line = `[${getTimestamp()}] ${message}`;
  console.log('[LIFF Debug]', line);

  try {
    const logs = getLiffLogs();
    logs.push(line);
    if (logs.length > MAX_LOGS) {
      logs.splice(0, logs.length - MAX_LOGS);
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    listeners.forEach((fn) => fn(logs));
  } catch {
    // ignore storage quota issues
  }
};

export const clearLiffLogs = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    listeners.forEach((fn) => fn([]));
  } catch {
    // ignore
  }
};

export const subscribeLiffLogs = (listener: LogListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Auto-record page lifecycle on boot
if (typeof window !== 'undefined') {
  // Check if page reloaded
  const reloadCountKey = 'wb_liff_reload_count';
  let count = 1;
  try {
    const prev = sessionStorage.getItem(reloadCountKey);
    count = prev ? parseInt(prev, 10) + 1 : 1;
    sessionStorage.setItem(reloadCountKey, count.toString());
  } catch {
    // ignore
  }

  addLiffLog(`🚀 Page Loaded/Mounted (Load #${count}) | UA: ${navigator.userAgent.slice(0, 60)}...`);

  document.addEventListener('visibilitychange', () => {
    addLiffLog(`👁️ Visibility changed: ${document.visibilityState}`);
  });

  window.addEventListener('error', (e) => {
    addLiffLog(`❌ Uncaught Error: ${e.message} at ${e.filename}:${e.lineno}`);
  });

  window.addEventListener('unhandledrejection', (e) => {
    addLiffLog(`❌ Unhandled Promise: ${e.reason?.message || String(e.reason)}`);
  });
}
