"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { config } from "@/helpers/config";

export default function FavoriteEditPage({ params }) {
  const { id } = params;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
   const API_BASE = process.env.NEXT_PUBLIC_API_BASE || config.apiURL;

  useEffect(() => {
    fetchMovie();
  }, [id]);

  const fetchMovie = async () => {
    try {
      const res = await fetch(`${API_BASE}/movies/id/${id}`);
      if (!res.ok) throw new Error("Movie not found");
      const data = await res.json();
      setMovie(data.returnBody || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-warning"></div>
        <p className="mt-3">Loading movie...</p>
      </div>
    );

  if (!movie)
    return (
      <div className="container py-4">
        <div className="alert alert-danger">Movie not found.</div>
        <button
          className="btn btn-outline-secondary"
          onClick={() => router.push(`/${locale}/dashboard/favorites`)}
        >
          ← Back
        </button>
      </div>
    );

  return (
    <div className="container py-4">
      <h1 className="mb-4">🎬 {movie.title}</h1>
      <img
        src={movie.posterUrl || "/no-poster.png"}
        alt={movie.title}
        className="img-fluid rounded shadow-sm mb-3"
        style={{ maxWidth: "320px", height: "auto" }}
      />
      <p>
        <strong>Genre:</strong> {movie.genre?.join(", ") || "N/A"}
      </p>
      <p>
        <strong>Release Date:</strong> {movie.releaseDate || "Unknown"}
      </p>
      <p>{movie.summary}</p>

      <button
        className="btn btn-outline-secondary"
        onClick={() => router.push(`/${locale}/dashboard/favorites`)}
      >
        ← Back to Favorites
      </button>
    </div>
  );
}
