"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";

// Backend URL'ini .env.local'dan çekiyoruz:
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

/**
 * Props:
 *  - title: başlık
 *  - basePath: /tr/admin/users gibi
 *  - showNew: buton gösterilsin mi (varsayılan: true)
 *  - createRoles: "+ New" butonunu kimler görsün?
 *  - detailRoles: "Detay/Düzenle" linkini kimler görsün?
 */
export default function ModuleList({
  title,
  basePath,
  showNew = true,
  createRoles = ["ADMIN"],
  detailRoles = ["ADMIN"],
}) {
  const { roles = [] } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const canCreate = roles.some((r) => createRoles.includes(r));
  const canDetail = roles.some((r) => detailRoles.includes(r));

  // Backend'den kullanıcı listesini çek
  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/users/admin`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error(`Hata: ${res.status}`);
        const data = await res.json();
        // Bazı API'ler { content: [...] } döner; o yüzden kontrol
        const list = Array.isArray(data) ? data : data.content || [];
        setUsers(list);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  return (
    <section style={{ marginTop: 20 }}>
      {/* Üst başlık */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>{title}</h1>
        {showNew && canCreate && (
          <Link
            href={`${basePath}/new`}
            className="btn btn-warning fw-semibold"
          >
            + New
          </Link>
        )}
      </div>

      {/* İçerik */}
      <div
        style={{
          marginTop: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 16,
          backgroundColor: "#111",
          color: "#fff",
        }}
      >
        {loading && <p>Yükleniyor...</p>}
        {error && <p style={{ color: "red" }}>Hata: {error}</p>}

        {!loading && !error && users.length === 0 && (
          <p>Henüz kullanıcı bulunamadı.</p>
        )}

        {!loading && !error && users.length > 0 && (
          <table className="table table-dark table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ad</th>
                <th>Soyad</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Rol</th>
                {canDetail && <th>İşlem</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.surname}</td>
                  <td>{u.email}</td>
                  <td>{u.phoneNumber}</td>
                  <td>{u.roles ? Array.from(u.roles).join(", ") : "—"}</td>
                  {canDetail && (
                    <td>
                      <Link
                        href={`${basePath}/${u.id}`}
                        className="btn btn-sm btn-outline-warning"
                      >
                        Düzenle
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
