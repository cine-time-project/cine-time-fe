"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { config } from "@/helpers/config";
import { useTranslations } from "next-intl";

export default function AdminFavoritesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || config.apiURL;

  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ✔ FAVORITES ADMIN NAMESPACE
  const t = useTranslations("favoritesAdmin");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace(`/${locale}/login`);
      return;
    }

    fetch(`${API_BASE}/favorites/movies/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(t("errorStats"));
        return res.json();
      })
      .then(async (data) => {
        const list = data.returnBody || [];

        const detailed = await Promise.all(
          list.map(async (item) => {
            try {
              const res = await fetch(`${API_BASE}/movies/id/${item.id}`);

              if (!res.ok) return { ...item, title: t("unknownMovie") };

              const detail = await res.json();
              const m = detail.returnBody || {};

              return {
                ...item,
                title: m.title,
                releaseDate: m.releaseDate,
                posterUrl:
                  m.posterUrl ||
                  (m.posterId ? `${API_BASE}/images/${m.posterId}` : null),
                genre: m.genre,
              };
            } catch {
              return { ...item, title: t("unknownMovie") };
            }
          })
        );

        setFavorites(detailed);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [API_BASE, locale, router, t]);

  if (loading) return <div className="text-center py-5">⏳ {t("loading")}</div>;

  if (error) return <div className="alert alert-danger m-3">{error}</div>;

  return (
    <div className="container py-5">
      {/* Üst başlık ve Yeni Favori Ekle butonu */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">🎬 {t("statsTitle")}</h2>
        <Link
          href={`/${locale}/admin/favorites/new`}
          className="btn btn-primary btn-sm"
        >
          ➕ {t("addNewFavorite")}
        </Link>
      </div>

      {favorites.length === 0 ? (
        <p className="text-muted">{t("noFavorites")}</p>
      ) : (
        <div className="row g-4">
          {favorites.map((m) => (
            <div className="col-md-3 col-sm-6" key={m.id}>
              <div className="card shadow-sm h-100 border-0">
                <img
                  src={m.posterUrl || "/no-poster.png"}
                  className="card-img-top"
                  alt={m.title || t("unknownMovie")}
                  style={{
                    height: "360px",
                    width: "100%",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
                <div className="card-body">
                  <h6 className="card-title text-truncate mb-1">
                    {m.title || t("unknownMovie")}
                  </h6>
                  <p className="text-muted small mb-2">
                    {m.releaseDate || t("noDate")} <br />
                    {m.genre?.join(", ") || ""}
                  </p>
                  <p className="text-muted small">
                    {m.favCount} {t("favorites")}
                  </p>
                  <Link
                    href={`/${locale}/admin/favorites/${m.id}/users`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    {t("seeUsers")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
