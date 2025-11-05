"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function FavoriteDetailPage({ params }) {
  const { id } = params; // URL'den film ID’sini alır
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace(`/${locale}/login`);
      return;
    }
    fetchMovie(token);
  }, []);

  const fetchMovie = async (token) => {
    try {
      const res = await fetch(`${API_BASE}/movies/id/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Film bulunamadı");
      const data = await res.json();
      setMovie(data.returnBody || data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning"></div>
        <p>Film yükleniyor...</p>
      </div>
    );

  if (!movie)
    return (
      <div className="container py-5 text-center">
        <p>Film bulunamadı.</p>
        <Link href={`/${locale}/admin/favorites`} className="btn btn-secondary">
          ← Favorilere Dön
        </Link>
      </div>
    );

  return (
    <div className="container py-4">
      <h1 className="mb-4">{movie.title}</h1>
      <div className="row">
        <div className="col-md-4">
          <img
            src={movie.posterUrl || "/no-poster.png"}
            alt={movie.title}
            className="img-fluid rounded shadow-sm"
          />
        </div>
        <div className="col-md-8">
          <p>
            <strong>Yayın Tarihi:</strong> {movie.releaseDate}
          </p>
          <p>
            <strong>Yönetmen:</strong> {movie.director}
          </p>
          <p>
            <strong>Tür:</strong> {movie.genre?.join(", ")}
          </p>
          <p>
            <strong>Özet:</strong> {movie.summary}
          </p>
          <p>
            <strong>Puan:</strong> ⭐ {movie.rating || "—"}
          </p>

          {movie.trailerUrl && (
            <a
              href={movie.trailerUrl}
              target="_blank"
              className="btn btn-outline-warning me-3"
            >
              🎬 Fragmanı İzle
            </a>
          )}

          <Link
            href={`/${locale}/admin/favorites`}
            className="btn btn-outline-secondary"
          >
            ← Favorilere Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
