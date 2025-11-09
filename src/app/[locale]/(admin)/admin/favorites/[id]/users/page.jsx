"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { config } from "@/helpers/config";

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

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace(`/${locale}/login`);
      return;
    }

    fetch(`${API_BASE}/favorites/movies/${movieId}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Favorileyen kullanıcılar alınamadı");
        return res.json();
      })
      .then((data) => {
        const list = data.returnBody || [];
        setUsers(list);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [movieId]);

  if (loading) return <div className="text-center py-5">⏳ Yükleniyor...</div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">🎬 Bu filmi favorileyen kullanıcılar</h2>
        <Link
          href={`/${locale}/admin/favorites`}
          className="btn btn-outline-secondary btn-sm"
        >
          ← Geri dön
        </Link>
      </div>

      {users.length === 0 ? (
        <p className="text-muted">Henüz kimse bu filmi favorilememiş.</p>
      ) : (
        <ul className="list-group shadow-sm">
          {users.map((u) => (
            <li
              key={u.id}
              className="list-group-item d-flex justify-content-between"
            >
              <span>{u.username || u.email}</span>
              <span className="text-muted small">{u.email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
