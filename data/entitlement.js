import AsyncStorage from "@react-native-async-storage/async-storage";

const ENTITLEMENT_STORAGE_KEY = "zenflow.web.entitlement";
const VERIFY_TIMEOUT_MS = 5000;

export function getStoredToken() {
  return AsyncStorage.getItem(ENTITLEMENT_STORAGE_KEY);
}

export function storeToken(token) {
  return AsyncStorage.setItem(ENTITLEMENT_STORAGE_KEY, token);
}

export function clearToken() {
  return AsyncStorage.removeItem(ENTITLEMENT_STORAGE_KEY);
}

// Fails open: network errors/timeouts keep the cached unlock (so a paying,
// offline user is never locked out). Only an explicit `valid:false` from the
// server clears the entitlement.
export async function verifyStoredToken(token) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  try {
    const response = await fetch("/api/verify-entitlement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      signal: controller.signal,
    });
    if (!response.ok) return true;
    const data = await response.json();
    return data.valid !== false;
  } catch {
    return true;
  } finally {
    clearTimeout(timeout);
  }
}
