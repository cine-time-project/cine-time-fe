"use client";

import { Button } from "primereact/button";
import { useTranslations } from "next-intl";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useState } from "react";

/**
 * FavoriteButton Component
 * ------------------------
 * A reusable button component for toggling movie favorites
 * Can be used in movie cards, detail pages, and other components
 */
export default function FavoriteButton({
  movie,
  showText = false,
  size = "small",
  variant = "outlined",
  className = "",
}) {
  const t = useTranslations();
  const { isFavorite, toggleFavorite, isLoggedIn } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);

  const movieIsFavorite = isFavorite(movie?.id);

  const handleToggle = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsLoading(true);
    try {
      await toggleFavorite(movie);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Button
        icon="pi pi-heart"
        label={showText ? t("auth.loginRequired") : ""}
        size={size}
        outlined
        disabled
        className={`favorite-button ${className}`}
        title={t("movies.loginToFavorite")}
      />
    );
  }

  return (
    <Button
      icon={`pi ${movieIsFavorite ? "pi-heart-fill" : "pi-heart"}`}
      label={
        showText
          ? movieIsFavorite
            ? t("movies.removeFromFavorites")
            : t("movies.addToFavorites")
          : ""
      }
      size={size}
      outlined={!movieIsFavorite || variant === "outlined"}
      severity={movieIsFavorite ? "danger" : "secondary"}
      loading={isLoading}
      onClick={handleToggle}
      className={`favorite-button ${
        movieIsFavorite ? "favorite-active" : ""
      } ${className}`}
      title={
        movieIsFavorite
          ? t("movies.removeFromFavorites")
          : t("movies.addToFavorites")
      }
    />
  );
}
