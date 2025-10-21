"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  fetchFavoriteMovieIds,
  addFavoriteMovie,
  removeFavoriteMovie,
} from "@/services/favorite-service";

// Basit bus: aynı sekmede tüm bileşenleri senkron tut
const bus =
  typeof window !== "undefined"
    ? window
    : { addEventListener() {}, removeEventListener() {}, dispatchEvent() {} };

// Token bazlı localStorage key (hızlı açılış için)
function favKey() {
  try {
    const t =
      localStorage.getItem("authToken") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");
    return t ? `ct.favs.${t.slice(0, 12)}` : null;
  } catch {
    return null;
  }
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
// taze token kontrolü (memo değil, her seferinde gerçek durumu okur)
function hasToken() {
  try {
    return !!(
      localStorage.getItem("authToken") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token")
    );
  } catch {
    return false;
  }
}

export function useFavorites() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams();
  const loginUrl = `/${locale || "tr"}/login?redirect=${encodeURIComponent(
    pathname || "/"
  )}`;

  const [ids, setIds] = useState(() => readLS());

  // İlk mount: login ise DB'den çek (LS ile senkronla)
  useEffect(() => {
    if (!hasToken()) {
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
  }, []); // her mount'ta bir kez; token kontrolü fonksiyon içinde

  // Diğer bileşenlerden değişiklikleri + login/logout'u dinle
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

    const onAuth = async () => {
      if (hasToken()) {
        // login oldu: DB'den taze liste çek
        try {
          const dbIds = await fetchFavoriteMovieIds();
          setIds(dbIds);
          writeLS(dbIds);
        } catch {}
      } else {
        // logout oldu: temizle
        setIds([]);
        writeLS([]);
      }
    };

    bus.addEventListener("favorites-change", onFav);
    bus.addEventListener("auth-change", onAuth);
    return () => {
      bus.removeEventListener("favorites-change", onFav);
      bus.removeEventListener("auth-change", onAuth);
    };
  }, []);

  const isFavorite = (movieId) => ids.includes(Number(movieId));

  // Toggle (optimistic UI)
  const toggleFavorite = async (movie) => {
    const movieId = movie?.id;
    if (!movieId) return;

    if (!hasToken()) {
      router.push(loginUrl);
      return;
    }

    const already = isFavorite(movieId);

    // Optimistic güncelleme
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
      // add/remove servisleri idempotent (409/404 başarı sayılıyor)
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

  return {
    ids,
    isFavorite,
    toggleFavorite,
    isLoggedIn: hasToken(),
  };
}
