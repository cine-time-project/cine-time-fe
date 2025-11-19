"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { config } from "@/helpers/config";
import { useTranslations } from "next-intl";

export default function NewFavoritePage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || config.apiURL;

  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const observerRef = useRef(null);

  // ✔ FAVORITES TRANSLATION
  const t = useTranslations("favoritesAdmin");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) router.replace(`/${locale}/login`);
  }, []);

  useEffect(() => {
    fetchMovies(0, true);
  }, [query]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMovies(page + 1);
        }
      },
      { threshold: 0.8 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [observerRef.current, hasMore, loading, page]);

  const fetchMovies = async (pageNumber = 0, reset = false) => {
    try {
      setLoading(true);
      const url = new URL(`${API_BASE}/movies/search`);
      if (query.trim()) url.searchParams.set("q", query.trim());
      url.searchParams.set("page", pageNumber);
      url.searchParams.set("size", "12");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(t("moviesError"));

      const data = await res.json();
      const pageData = data.returnBody || {};
      const list = Array.isArray(pageData?.content) ? pageData.content : [];

      const mapped = list.map((m) => {
        let posterUrl = m.posterUrl;
        if (!posterUrl && m.posterId)
          posterUrl = `${API_BASE}/images/${m.posterId}`;
        if (!posterUrl && m.poster)
          posterUrl = `${API_BASE}/images/${m.poster}`;
        return { ...m, posterUrl };
      });

      setHasMore(!pageData.last);
      setPage(pageNumber);
      if (reset) setOptions(mapped);
      else setOptions((prev) => [...prev, ...mapped]);
    } catch (e) {
      setError(e.message || t("moviesError"));
    } finally {
      setLoading(false);
    }
  };

  const selectedMovie = useMemo(
    () => options.find((m) => String(m.id) === String(selectedId)),
    [options, selectedId]
  );

  const addFavorite = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("authToken");
    if (!token) return router.replace(`/${locale}/login`);
    if (!selectedId) {
      setError(t("selectMovie"));
      return;
    }

    try {
      setAdding(true);
      const res = await fetch(`${API_BASE}/favorites/movies/${selectedId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || t("addError"));
      }

      setSuccess(t("addSuccess"));

      setTimeout(() => router.push(`/${locale}/admin/favorites`), 2000);
    } catch (err) {
      setError(err.message || t("addError"));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 820 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">➕ {t("newFavoriteTitle")}</h2>
        <Link
          href={`/${locale}/admin/favorites`}
          className="btn btn-outline-secondary btn-sm"
        >
          ← {t("back")}
        </Link>
      </div>

      <form onSubmit={addFavorite} className="card p-4 shadow-sm border-0">
        <div className="mb-3">
          <label className="form-label">{t("searchLabel")}</label>
          <input
            type="text"
            className="form-control"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div
          className="border rounded bg-white mb-3"
          style={{
            maxHeight: "320px",
            overflowY: "auto",
            border: "1px solid #ced4da",
          }}
        >
          <ul className="list-group list-group-flush">
            {options.length === 0 && !loading ? (
              <li className="list-group-item text-muted small">
                {t("noResults")}
              </li>
            ) : (
              options.map((m, idx) => (
                <li
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`list-group-item list-group-item-action d-flex align-items-center ${
                    String(m.id) === String(selectedId) ? "active" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={m.posterUrl || "/no-poster.png"}
                    alt={m.title}
                    style={{
                      width: 40,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 4,
                      marginRight: 10,
                    }}
                  />
                  <div>
                    <div className="fw-semibold">{m.title}</div>
                    <div className="text-muted small">
                      {m.releaseDate ? `(${m.releaseDate})` : ""}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>

          <div ref={observerRef} className="text-center py-3">
            {loading && (
              <div className="text-muted small">⏳ {t("loading")}</div>
            )}
          </div>
        </div>

        {selectedMovie && (
          <div className="mb-3 d-flex align-items-center gap-3">
            <img
              src={selectedMovie.posterUrl || "/no-poster.png"}
              alt={selectedMovie.title}
              style={{
                width: 90,
                height: 130,
                objectFit: "cover",
                borderRadius: 6,
              }}
            />
            <div>
              <div className="fw-semibold">{selectedMovie.title}</div>
              <div className="text-muted small">
                {selectedMovie.genre?.join(", ") || ""}{" "}
                {selectedMovie.duration ? `• ${selectedMovie.duration} dk` : ""}
              </div>
            </div>
          </div>
        )}

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}

        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!selectedId || adding}
          >
            {adding ? t("adding") : t("addButton")}
          </button>

          <Link
            href={`/${locale}/admin/favorites`}
            className="btn btn-outline-secondary"
          >
            {t("cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
