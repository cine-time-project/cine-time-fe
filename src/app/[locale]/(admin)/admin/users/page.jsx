"use client";
import { use } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { searchUsers } from "@/services/users-service";
import { useAuth } from "@/lib/auth/useAuth";

export default function AdminUsersPage({ params }) {
  const { locale } = use(params); // ✅ Promise unwrap edildi
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { roles } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const data = await searchUsers({ page: 0, size: 50 });
        const list = data?.returnBody?.content || data?.content || [];
        setUsers(list);
      } catch (err) {
        console.error("Kullanıcılar yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="p-3 text-muted">Yükleniyor...</p>;

  return (
    <div className="page">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="section-title m-0">Kullanıcılar</h1>
        {(roles.includes("ADMIN") || roles.includes("EMPLOYEE")) && (
          <Link href={`/${locale}/admin/users/new`} className="btn btn-primary">
            + Yeni Kullanıcı
          </Link>
        )}
      </div>

      {users.length === 0 ? (
        <p className="text-muted">Kayıtlı kullanıcı bulunamadı.</p>
      ) : (
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ad</th>
              <th>Soyad</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Cinsiyet</th>
              <th></th>
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
                <td>{u.gender}</td>
                <td>
                  {(roles.includes("ADMIN") || roles.includes("EMPLOYEE")) && (
                    <Link
                      href={`/${locale}/admin/users/${u.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Düzenle
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
