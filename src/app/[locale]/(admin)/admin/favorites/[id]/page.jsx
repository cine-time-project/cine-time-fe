"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { config } from "@/helpers/config";
import { useTranslations } from "next-intl";

export default function FavoriteUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { id } = useParams();
  const locale = pathname.split("/")[1] || "tr";
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || config.apiURL;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✔ FAVORITES ADMIN çeviri namespace
  const t = useTranslations("favoritesAdmin");

  useEffect(() => {
    fetchUsers();
  }, [id]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error(t("sessionExpired"));

      const res = await fetch(`${API_BASE}/favorites/movies/${id}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(t("errorUsers"));

      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError(e.message || t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3">{t("loading")}</p>
      </div>
    );

  if (error)
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">👥 {t("usersTitle")}</h2>
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
        <table className="table table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>{t("table.name")}</th>
              <th>{t("table.email")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id}>
                <td>{idx + 1}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
