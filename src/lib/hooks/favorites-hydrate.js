"use client";
import { fetchFavoriteMovieIds } from "@/services/favorite-service";

export async function hydrateFavoritesForToken() {
  try {
    const ids = await fetchFavoriteMovieIds();
    const token = localStorage.getItem("authToken") || "";
    const key = token ? `ct.favs.${token.slice(0, 12)}` : "";
    if (key) localStorage.setItem(key, JSON.stringify(ids.map(Number)));
    document.dispatchEvent(new Event("favorites-hydrated"));
  } catch (e) {
    console.warn("[favorites] hydrate failed:", e?.message);
  }
}

export function clearFavoriteCaches() {
  try {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith("ct.favs.")) localStorage.removeItem(k);
    });
    document.dispatchEvent(new Event("favorites-hydrated"));
  } catch {}
}
