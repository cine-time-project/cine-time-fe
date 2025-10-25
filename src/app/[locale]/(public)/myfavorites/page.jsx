"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter, useParams } from "next/navigation";
import { fetchFavoriteMovies } from "@/services/favorite-service";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { Skeleton } from "primereact/skeleton";
import { Message } from "primereact/message";
import { Button } from "primereact/button";
import MovieCard from "@/components/movies/movie-card/MovieCard";
import FavoriteMovieCard from "@/components/movies/movie-card/FavoriteMovieCard";
import SectionTitle from "@/components/common/SectionTitle";

export default function MyFavoritesPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const { locale } = useParams();
  const router = useRouter();
  const { ids: favoriteIds, isLoggedIn } = useFavorites();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Add hydration check to prevent SSR mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Eğer kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (!isHydrated) return; // Wait for hydration

    if (!isLoggedIn) {
      router.push(
        `/${locale}/login?redirect=${encodeURIComponent(
          `/${locale}/myfavorites`
        )}`
      );
      return;
    }
  }, [isLoggedIn, locale, router, isHydrated]);

  // Favori filmlerini yükle
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadFavorites = async () => {
      try {
        setLoading(true);
        setError(null);
        const favoriteMovies = await fetchFavoriteMovies();
        setMovies(favoriteMovies);
      } catch (err) {
        console.error("Error loading favorites:", err);
        setError(err.message || "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [isLoggedIn, favoriteIds]); // favoriteIds değiştiğinde yeniden yükle

  // Favori değişikliklerini dinle
  useEffect(() => {
    const handleFavoritesChange = () => {
      // Favori listesi değiştiğinde yeniden yükle
      if (isLoggedIn) {
        fetchFavoriteMovies().then(setMovies).catch(console.error);
      }
    };

    window.addEventListener("favorites-change", handleFavoritesChange);
    window.addEventListener("favorites-hydrated", handleFavoritesChange);

    return () => {
      window.removeEventListener("favorites-change", handleFavoritesChange);
      window.removeEventListener("favorites-hydrated", handleFavoritesChange);
    };
  }, [isLoggedIn]);

  // Show loading during hydration to prevent SSR mismatch
  if (!isHydrated) {
    return (
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <div className="row">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                  <div className="card h-100">
                    <Skeleton height="300px" className="mb-2"></Skeleton>
                    <div className="card-body">
                      <Skeleton height="1.5rem" className="mb-2"></Skeleton>
                      <Skeleton height="1rem" width="70%"></Skeleton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Giriş yapmamış kullanıcı için erken dönüş
  if (!isLoggedIn) {
    return (
      <div className="container py-4">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="text-center">
            <i
              className="pi pi-lock"
              style={{ fontSize: "3rem", color: "var(--primary-color)" }}
            ></i>
            <h3 className="mt-3">{t("auth.loginRequired")}</h3>
            <p className="text-muted">{t("favorites.loginToView")}</p>
            <Button
              label={t("nav.login")}
              icon="pi pi-sign-in"
              onClick={() => router.push(`/${locale}/login`)}
              className="mt-3"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <SectionTitle
            title={t("favorites.title")}
            subtitle={t("favorites.description")}
            className="mb-4"
          />

          {/* Yükleniyor durumu */}
          {loading && (
            <div className="row">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                  <div className="card h-100">
                    <Skeleton height="300px" className="mb-2"></Skeleton>
                    <div className="card-body">
                      <Skeleton height="1.5rem" className="mb-2"></Skeleton>
                      <Skeleton height="1rem" width="70%"></Skeleton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Hata durumu */}
          {error && !loading && (
            <div className="text-center py-5">
              <Message severity="error" text={error} className="mb-3" />
              <Button
                label={t("common.retry")}
                icon="pi pi-refresh"
                onClick={() => window.location.reload()}
              />
            </div>
          )}

          {/* Favori filmler */}
          {!loading && !error && movies.length > 0 && (
            <div className="row">
              {movies.map((movie) => (
                <div key={movie.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                  <FavoriteMovieCard movie={movie} />
                </div>
              ))}
            </div>
          )}

          {/* Boş favori listesi */}
          {!loading && !error && movies.length === 0 && (
            <div className="text-center py-5">
              <i
                className="pi pi-heart"
                style={{ fontSize: "4rem", color: "var(--surface-400)" }}
              ></i>
              <h3 className="mt-3 text-muted">{t("favorites.empty")}</h3>
              <p className="text-muted mb-4">
                {t("favorites.emptyDescription")}
              </p>
              <Button
                label={t("favorites.browseMovies")}
                icon="pi pi-search"
                onClick={() => router.push(`/${locale}/movies`)}
                className="me-2"
              />
              <Button
                label={t("nav.home")}
                icon="pi pi-home"
                outlined
                onClick={() => router.push(`/${locale}`)}
              />
            </div>
          )}

          {/* Favori sayısı bilgisi */}
          {!loading && !error && movies.length > 0 && (
            <div className="text-center mt-4">
              <p
                className="fs-4 fw-bold text-warning mb-0"
                style={{
                  background: "linear-gradient(45deg, #ff8c00, #ffd700)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                  fontSize: "1.5rem",
                  fontWeight: "900",
                }}
              >
                {t("favorites.totalCount", { count: movies.length })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
