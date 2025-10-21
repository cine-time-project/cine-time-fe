"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";
import {
  fetchFavoriteMovieIds,
  addFavoriteMovie,
  removeFavoriteMovie,
} from "@/services/favorite-service";

// Basit event bus (aynı sayfadaki bileşenleri senkronlamak için)
const bus =
  typeof window !== "undefined"
    ? window
    : { addEventListener() {}, removeEventListener() {}, dispatchEvent() {} };

// Token -> LS key
function getToken() {
  try {
    return (
      localStorage.getItem("authToken") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      ""
    );
  } catch {
    return "";
  }
}
function favKey() {
  const t = getToken();
  return t ? `ct.favs.${t.slice(0, 12)}` : "";
}

function readLS() {
  try {
    const k = favKey();
    if (!k) return [];
    const raw = localStorage.getItem(k);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(Number) : [];
  } catch {
    return [];
  }
}
function writeLS(ids) {
  try {
    const k = favKey();
    if (!k) return;
    localStorage.setItem(k, JSON.stringify([...new Set(ids.map(Number))]));
  } catch {}
}

export function useFavorites() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams();

  const loginUrl = `/${locale || "tr"}/login?redirect=${encodeURIComponent(
    pathname || "/"
  )}`;

  const [ids, setIds] = useState(() => readLS());
  const isLoggedIn = useMemo(() => !!getToken(), []);

  // İlk yüklemede: login ise DB'den listeyi çek
  useEffect(() => {
    if (!isLoggedIn) {
      setIds([]);
      return;
    }
    let cancel = false;
    (async () => {
      try {
        const dbIds = await fetchFavoriteMovieIds();
        if (!cancel) {
          setIds(dbIds);
          writeLS(dbIds);
        }
      } catch (e) {
        console.error("[favorites] load error:", e?.message);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [isLoggedIn]);

  // Diğer bileşenlerden gelen değişiklikleri dinle
  useEffect(() => {
    const onFav = (e) => {
      const { type, movieId } = e.detail || {};
      if (!movieId) return;
      setIds((prev) => {
        const set = new Set(prev);
        if (type === "add") set.add(Number(movieId));
        if (type === "remove") set.delete(Number(movieId));
        const next = Array.from(set);
        writeLS(next);
        return next;
      });
    };
    const onAuth = () => setIds(readLS());
    const onHydrated = () => setIds(readLS());

    bus.addEventListener("favorites-change", onFav);
    bus.addEventListener("auth-change", onAuth);
    bus.addEventListener("favorites-hydrated", onHydrated);

    return () => {
      bus.removeEventListener("favorites-change", onFav);
      bus.removeEventListener("auth-change", onAuth);
      bus.removeEventListener("favorites-hydrated", onHydrated);
    };
  }, []);

  const isFavorite = (movieId) => ids.includes(Number(movieId));

  // Toggle (optimistic)
  const toggleFavorite = async (movie) => {
    const movieId = movie?.id;
    if (!movieId) return;

    if (!isLoggedIn) {
      router.push(loginUrl);
      return;
    }

    const already = isFavorite(movieId);
    bus.dispatchEvent(
      new CustomEvent("favorites-change", {
        detail: { type: already ? "remove" : "add", movieId },
      })
    );

    try {
      if (already) {
        await removeFavoriteMovie(movieId);
      } else {
        await addFavoriteMovie(movieId);
      }
    } catch (e) {
      console.error("[favorites] toggle error:", e?.message);
      // rollback
      bus.dispatchEvent(
        new CustomEvent("favorites-change", {
          detail: { type: already ? "add" : "remove", movieId },
        })
      );
    }
  };

  return { ids, isFavorite, toggleFavorite, isLoggedIn };
}

// İstersen default da ver; yanlışlıkla default import edilirse de çalışsın
export default useFavorites;
