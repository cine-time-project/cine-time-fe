"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import ActionsBar from "./ActionsBar";
import { addFavoriteMovie, removeFavoriteMovie } from "@/services/favorite-service";

export default function FavoriteController({ movie }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isFavorite, setIsFavorite] = useState(!!movie?.isFavorite);
  const [favBusy, setFavBusy] = useState(false);

  // login durumunu sadece client'ta belirle
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("authToken"));
  }, []);

  // başka bir filme geçilirse state'i senkronla
  useEffect(() => {
    setIsFavorite(!!movie?.isFavorite);
  }, [movie?.id, movie?.isFavorite]);

  const onToggleFavorite = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (favBusy) return;

    setFavBusy(true);
    const targetAdd = !isFavorite;
    setIsFavorite(targetAdd); // optimistic

    try {
      if (targetAdd) {
        await addFavoriteMovie(movie.id);   // 409'u başarı sayıyoruz
      } else {
        await removeFavoriteMovie(movie.id); // 404'ü başarı sayıyoruz
      }
    } catch (e) {
      setIsFavorite(!targetAdd); // geri al
      const st = e?.response?.status;
      if (st === 401 || st === 403) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        console.error(e);
        alert("Favori güncellenemedi. Lütfen tekrar deneyin.");
      }
    } finally {
      setFavBusy(false);
    }
  };

  return (
    <ActionsBar
      movie={movie}
      isFavorite={isFavorite}
      favBusy={favBusy}
      isLoggedIn={isLoggedIn}
      onToggleFavorite={onToggleFavorite}
    />
  );
}
