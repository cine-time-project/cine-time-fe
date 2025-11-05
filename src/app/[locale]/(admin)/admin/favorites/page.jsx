"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || config.apiURL;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace(`/${locale}/login`);
      return;
    }
    fetchFavorites(token);
  }, []);

  const fetchFavorites = async (token) => {
    try {
      setLoading(true);
      // 1️⃣ Favori film ID'lerini getir
      const res = await fetch(`${API_BASE}/favorites/movies/auth`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Favoriler alınamadı");
      const ids = await res.json();

      // 2️⃣ Her film ID'si için detay bilgisini çek
      const movieDetails = await Promise.all(
        ids.map(async (id) => {
          const r = await fetch(`${API_BASE}/movies/id/${id}`);
          if (!r.ok) return null;
          const data = await r.json();
          const movie = data.returnBody || data;

          // 🔹 Poster URL’sini backend’den al
          if (movie.posterId) {
            movie.posterUrl = `${API_BASE}/images/${movie.posterId}`;
          } else if (movie.poster) {
            movie.posterUrl = `${API_BASE}/images/${movie.poster}`;
          }

          return movie;
        })
      );

      setFavorites(movieDetails.filter(Boolean));
    } catch (err) {
      console.error("Favoriler yüklenirken hata:", err);
      alert("Favoriler yüklenemedi!");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (movieId) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
      router.replace(`/${locale}/login`);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/favorites/movies/${movieId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Favori kaldırılamadı");
      setFavorites((prev) => prev.filter((m) => m.id !== movieId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading)
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3">Favoriler yükleniyor...</p>
      </div>
    );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">🎬 Favori Filmlerim</h1>
        <Link
          href={`/${locale}/admin/favorites/new`}
          className="btn btn-warning btn-sm"
        >
          ➕ Yeni Favori Film Ekle
        </Link>
      </div>

      {favorites.length === 0 ? (
        <p className="text-muted">Henüz favori film eklemedin.</p>
      ) : (
        <div className="row g-4">
          {favorites.map((movie) => (
            <div className="col-md-3 col-sm-6" key={movie.id}>
              <div className="card shadow-sm h-100 border-0">
                <img
                  src={movie.posterUrl || "/no-poster.png"}
                  className="card-img-top"
                  alt={movie.title}
                  style={{
                    height: "360px",
                    width: "100%",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
                <div className="card-body">
                  <h6 className="card-title text-truncate mb-1">
                    {movie.title}
                  </h6>
                  <p className="text-muted small mb-2">
                    {movie.releaseDate || "Tarih Yok"} <br />
                    {movie.genre?.join(", ") || ""}
                  </p>
                  <button
                    onClick={() => removeFavorite(movie.id)}
                    className="btn btn-outline-danger btn-sm"
                  >
                    ❤️ Favoriden Kaldır
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
