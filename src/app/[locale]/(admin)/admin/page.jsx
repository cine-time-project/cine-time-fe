"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, Button, Form } from "react-bootstrap";
import { config } from "@/helpers/config";

export default function AdminUsersPage() {
  const { roles = [], loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";

  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!roles.includes("ADMIN") && !roles.includes("EMPLOYEE")) {
        router.replace(`/${locale}/login?redirect=${pathname}`);
      } else {
        fetchUsers();
      }
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async (search = "") => {
    try {
      const endpoint = search
        ? `/users/admin?q=${encodeURIComponent(search)}`
        : `/users/admin/all`;

      const res = await fetch(`${config.apiURL}${endpoint}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("authToken"),
        },
      });

      if (!res.ok) {
        console.error("User fetch failed:", res.status, res.statusText);
        setUsers([]);
        return;
      }

      const data = await res.json();
      const list = data?.returnBody?.content || data?.returnBody || data;
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("User fetch error:", err);
      setUsers([]);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Kullanıcıyı silmek istiyor musun?")) return;
    try {
      const res = await fetch(`${config.apiURL}/users/${id}/admin`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("authToken"),
        },
      });
      if (!res.ok) {
        console.error("User delete failed:", res.status, res.statusText);
      }
      fetchUsers();
    } catch (err) {
      console.error("User delete error:", err);
    }
  };

  const formatRoles = (roles) => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) return "—";
    return roles
      .map((r) => r.roleName || r.name || r.authority || "—")
      .join(", ");
  };

  if (loading) return <p className="text-muted">Yükleniyor...</p>;

  return (
    <div className="page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="section-title mb-0">Kullanıcılar</h1>
        <Button
          variant="primary"
          style={{ backgroundColor: "var(--brand)", border: "none" }}
          onClick={() => router.push(`/${locale}/admin/users/new`)}
        >
          + Yeni Kullanıcı
        </Button>
      </div>

      <Form
        className="d-flex mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          fetchUsers(query);
        }}
      >
        <Form.Control
          type="search"
          placeholder="Kullanıcı ara..."
          className="me-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button variant="outline-primary" type="submit">
          Ara
        </Button>
      </Form>

      <div className="card p-3 card-hover">
        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Ad</th>
              <th>Soyad</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Roller</th>
              <th>İşlemler</th>
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
                <td>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() =>
                      router.push(`/${locale}/admin/users/${u.id}`)
                    }
                    className="me-2"
                  >
                    Düzenle
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(u.id)}
                  >
                    Sil
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
