"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  fetchFavoriteMovieIds,
  addFavoriteMovie,
  removeFavoriteMovie,
} from "@/services/favorite-service";

// Basit event-bus: tüm bileşenler aynı anda güncellensin
const bus = typeof window !== "undefined" ? window : { addEventListener(){}, removeEventListener(){}, dispatchEvent(){} };

// Token'a bağlı lokal cache key (hızlı açılış için)
function favKey() {
  try {
    const t = localStorage.getItem("authToken") || localStorage.getItem("access_token") || localStorage.getItem("token");
    return t ? `ct.favs.${t.slice(0,12)}` : null;
  } catch { return null; }
}
function readLS() {
  try {
    const k = favKey(); if (!k) return [];
    const raw = localStorage.getItem(k);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(Number) : [];
  } catch { return []; }
}
function writeLS(ids) {
  try {
    const k = favKey(); if (!k) return;
    localStorage.setItem(k, JSON.stringify([...new Set(ids.map(Number))]));
  } catch {}
}

export function useFavorites() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams();
  const loginUrl = `/${locale || "tr"}/login?redirect=${encodeURIComponent(pathname || "/")}`;

  const [ids, setIds] = useState(() => readLS());
  const isLoggedIn = useMemo(() => {
    try {
      return !!(localStorage.getItem("authToken") || localStorage.getItem("access_token") || localStorage.getItem("token"));
    } catch { return false; }
  }, []);

  // İlk yüklemede: login ise DB'den çek ve LS ile senkronla
  useEffect(() => {
    if (!isLoggedIn) { setIds([]); return; }
    let cancel = false;
    (async () => {
      try {
        const dbIds = await fetchFavoriteMovieIds();
        if (!cancel) { setIds(dbIds); writeLS(dbIds); }
      } catch (e) {
        console.error("[favorites] load error:", e?.message);
      }
    })();
    return () => { cancel = true; };
  }, [isLoggedIn]);

  // Diğer bileşenlerden değişiklikleri dinle
  useEffect(() => {
    const onFav = (e) => {
      const { type, movieId } = e.detail || {};
      if (!movieId) return;
      setIds(prev => {
        const set = new Set(prev);
        if (type === "add") set.add(Number(movieId));
        if (type === "remove") set.delete(Number(movieId));
        const next = Array.from(set);
        writeLS(next);
        return next;
      });
    };
    const onAuth = () => setIds(readLS());
    bus.addEventListener("favorites-change", onFav);
    bus.addEventListener("auth-change", onAuth);
    return () => {
      bus.removeEventListener("favorites-change", onFav);
      bus.removeEventListener("auth-change", onAuth);
    };
  }, []);

  const isFavorite = (movieId) => ids.includes(Number(movieId));

  // Asıl toggle: ilk tıklamada ekle + buton rengi değişsin, 2. tıklamada çıkar
  const toggleFavorite = async (movie) => {
    const movieId = movie?.id;
    if (!movieId) return;

    // login kontrolü
    if (!isLoggedIn) {
      router.push(loginUrl);
      return;
    }

    const already = isFavorite(movieId);

    // Optimistic UI
    bus.dispatchEvent(new CustomEvent("favorites-change", { detail: { type: already ? "remove" : "add", movieId }}));

    try {
      if (already) {
        await removeFavoriteMovie(movieId);
      } else {
        await addFavoriteMovie(movieId);
      }
    } catch (e) {
      console.error("[favorites] toggle error:", e?.message);
      // rollback
      bus.dispatchEvent(new CustomEvent("favorites-change", { detail: { type: already ? "add" : "remove", movieId }}));
    }
  };

  return { ids, isFavorite, toggleFavorite, isLoggedIn };
}
