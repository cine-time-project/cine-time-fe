"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { config } from "@/helpers/config";
import { useTranslations } from "next-intl";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const t = useTranslations("users");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || config.apiURL;

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const res = await fetch(`${API_BASE}/users/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok)
        throw new Error(`Kullanıcı listesi alınamadı (${res.status})`);

      const data = await res.json();

      // Backend formatını destekle (liste ya da sayfa)
      const list = Array.isArray(data)
        ? data
        : data?.returnBody?.content || data?.returnBody || [];

      // 🔹 ID’ye göre sırala
      const sorted = list.sort((a, b) => a.id - b.id);

      setUsers(sorted);
    } catch (err) {
      console.error("Kullanıcılar alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      const token = localStorage.getItem("authToken");

      // 🔹 DÜZELTİLDİ: /users kaldırıldı
      const res = await fetch(`${API_BASE}/${id}/admin`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(t("errorDelete"));
      alert(t("successDelete"));
      fetchUsers();
    } catch (err) {
      alert(t("errorDelete") + ": " + err.message);
    }
  };

  const formatRoles = (roles) => {
    if (!roles || roles.length === 0) return "—";

    // Backend: ["ADMIN", "EMPLOYEE", ...]
    if (Array.isArray(roles)) {
      return roles
        .map((r) => (typeof r === "string" ? r : r.roleName || r))
        .map((r) => t(`roles.${r.replace(/^ROLE_/, "")}`) || r)
        .join(", ");
    }

    return t(`roles.${String(roles)}`) || String(roles);
  };

  const formatGender = (gender) => {
    return t(`genders.${gender}`) || gender || "—";
  };

  if (loading) return <p className="p-3 text-muted">{t("loading")}</p>;

  return (
    <div className="page container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="section-title m-0">{t("title")}</h1>
        <Link
          href={`/${locale}/admin/users/new`}
          className="btn btn-primary"
          style={{ backgroundColor: "#f26522", border: "none" }}
        >
          {t("newButton")}
        </Link>
      </div>

      {message && (
        <div className="alert alert-success text-center">{message}</div>
      )}

      {users.length === 0 ? (
        <p className="text-muted">{t("noData")}</p>
      ) : (
        <div className="card shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>{t("table.id")}</th>
                <th>{t("table.name")}</th>
                <th>{t("table.surname")}</th>
                <th>{t("table.email")}</th>
                <th>{t("table.phone")}</th>
                <th>{t("table.roles")}</th>
                <th>{t("table.gender")}</th>
                <th>{t("table.actions")}</th>
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
                  <td>{formatRoles(u.roles)}</td>
                  <td>{formatGender(u.gender)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link
                        href={`/${locale}/admin/users/${u.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        {t("table.edit")}
                      </Link>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        {t("table.delete")}
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
