"use client";

import { useSyncExternalStore } from "react";

// --- Caching variables to prevent infinite loops ---
// `lastKnownValue` stores the raw string from localStorage.
let lastKnownValue = null;
// `cachedSnapshot` stores the parsed object.
let cachedSnapshot = null;

function subscribe(callback) {
  window.addEventListener("storage", callback);
  document.addEventListener("location-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    document.removeEventListener("location-change", callback);
  };
}

function getSnapshot() {
  try {
    const currentValue = localStorage.getItem("currentLocation");

    // If the raw string value hasn't changed, return the already cached object.
    // This is the key to preventing the infinite loop.
    if (currentValue === lastKnownValue) {
      return cachedSnapshot;
    }

    // The value has changed, so we need to parse it and update our cache.
    lastKnownValue = currentValue;
    cachedSnapshot = currentValue ? JSON.parse(currentValue) : null;

    return cachedSnapshot;
  } catch {
    // In case of a parsing error, reset and return null.
    localStorage.removeItem("currentLocation");
    lastKnownValue = null;
    cachedSnapshot = null;
    return null;
  }
}

export function useLocalStorageLocation() {
  // The third argument (getServerSnapshot) is important for SSR.
  // On the server, localStorage doesn't exist, so we always return null.
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}