/**
  - device ID generation for duplicate submission prevention
  - uses a persistent UUID stored in localStorage
  - cached in memory since device ID won't change during session
*/

const DEVICE_ID_KEY = 'imagine-device-id';

// cached device ID value
let cachedDeviceId: string | null = null;

/**
  - gets or creates a persistent device ID stored in localStorage
*/
function getOrCreateDeviceId(): string {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    // localStorage unavailable (e.g., private browsing in some browsers)
    // fall back to a session-only random ID
    return crypto.randomUUID();
  }
}

/**
  - generates a device ID for submission
  - result is cached for the duration of the session
  - @returns device ID string
*/
export function generateDeviceId(): string {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  cachedDeviceId = getOrCreateDeviceId();
  return cachedDeviceId;
}

/**
  - clears the cached device ID (mainly for testing)
*/
export function clearDeviceIdCache(): void {
  cachedDeviceId = null;
}
