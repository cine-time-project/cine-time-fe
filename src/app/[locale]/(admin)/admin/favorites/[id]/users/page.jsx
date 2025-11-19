"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { config } from "@/helpers/config";
import { useTranslations } from "next-intl";

export default function FavoriteUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const params = useParams();
  const movieId = params?.id;
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || config.apiURL;

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ✔ FAVORITES ADMIN namespace
  const t = useTranslations("favoritesAdmin");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace(`/${locale}/login`);
      return;
    }

    async function fetchUsers() {
      try {
        const res = await fetch(
          `${API_BASE}/favorites/movies/${movieId}/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error(t("errorUsers"));

        const data = await res.json();
        setUsers(data.returnBody || []);
      } catch (err) {
        setError(err.message || t("errorGeneric"));
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [movieId, API_BASE, locale, router, t]);

  if (loading) return <div className="text-center py-5">⏳ {t("loading")}</div>;

  if (error) return <div className="alert alert-danger m-3">{error}</div>;

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">🎬 {t("usersTitle")}</h2>

        <Link
          href={`/${locale}/admin/favorites`}
          className="btn btn-outline-secondary btn-sm"
        >
          ← {t("back")}
        </Link>
      </div>

      {users.length === 0 ? (
        <p className="text-muted">{t("noUsers")}</p>
      ) : (
        <ul className="list-group shadow-sm">
          {users.map((u, idx) => (
            <li
              key={u.id || `${u.email || "user"}-${idx}`}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{u.username || t("unknownUser")}</strong>
                <div className="text-muted small">{u.email || "-"}</div>
              </div>

              <span className="badge bg-primary">❤️ {t("favorite")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
