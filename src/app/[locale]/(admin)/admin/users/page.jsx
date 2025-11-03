"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
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

    const msg = sessionStorage.getItem("actionMessage");
    if (msg) {
      setMessage(msg);
      sessionStorage.removeItem("actionMessage");
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const res = await fetch(`${API_BASE}/users/4/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok)
        throw new Error(`Kullanıcı listesi alınamadı (${res.status})`);

      const data = await res.json();

      // 🔹 Sıralama ID’ye göre küçükten büyüğe
      const list = Array.isArray(data)
        ? data.sort((a, b) => a.id - b.id)
        : (data?.returnBody?.content || []).sort((a, b) => a.id - b.id);

      setUsers(list);
    } catch (err) {
      console.error("Kullanıcılar alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu kullanıcıyı silmek istediğine emin misin?")) return;
    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(`${API_BASE}/${id}/admin`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Silme işlemi başarısız.");
      alert("🗑️ Kullanıcı başarıyla silindi!");
      fetchUsers();
    } catch (err) {
      alert("Silme hatası: " + err.message);
    }
  };

  if (loading) return <p className="p-3 text-muted">Yükleniyor...</p>;

  return (
    <div className="page container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="section-title m-0">Kullanıcılar</h1>
        <Link
          href={`/${locale}/admin/users/new`}
          className="btn btn-primary"
          style={{ backgroundColor: "#f26522", border: "none" }}
        >
          + Yeni Kullanıcı
        </Link>
      </div>

      {message && (
        <div className="alert alert-success text-center">{message}</div>
      )}

      {users.length === 0 ? (
        <p className="text-muted">Hiç kullanıcı bulunamadı.</p>
      ) : (
        <div className="card shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Ad</th>
                <th>Soyad</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Cinsiyet</th>
                <th>İşlem</th>
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
                    <div className="d-flex gap-2">
                      <Link
                        href={`/${locale}/admin/users/${u.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
