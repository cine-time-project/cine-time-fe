"use client";

import { useEffect, useRef } from "react";
import { fetchFavoriteMovieIds } from "@/services/favorite-service";

// token oku
function getToken() {
  try {
    return (
      localStorage.getItem("authToken") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      ""
    );
  } catch { return ""; }
}
function favKey(token) {
  return token ? `ct.favs.${token.slice(0, 12)}` : "";
}

export default function FavoritesBoot() {
  const ran = useRef(false); // StrictMode double-run koruması

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = getToken();
    if (!token) return; // login değilse atla

    const run = async () => {
      try {
        const ids = await fetchFavoriteMovieIds();
        const key = favKey(token);
        if (key) localStorage.setItem(key, JSON.stringify(ids));
        // herkese haber ver: favoriler hazır
        document.dispatchEvent(new Event("favorites-hydrated"));
      } catch {
        // sessiz geç
      }
    };

    // mount olur olmaz çalıştır (idle varsa idle’da)
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(run, { timeout: 1000 });
    } else {
      setTimeout(run, 0);
    }
  }, []);

  return null;
}
