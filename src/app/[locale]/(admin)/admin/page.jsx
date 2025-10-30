"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, Button, Form } from "react-bootstrap";

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
  }, [loading]);

  const fetchUsers = async (search = "") => {
    try {
      const endpoint = search
        ? `/api/users/admin?q=${encodeURIComponent(search)}`
        : `/api/users/4/admin`;
      const res = await fetch(`http://localhost:8080${endpoint}`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      const data = await res.json();
      setUsers(data.returnBody?.content || data);
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Kullanıcıyı silmek istiyor musun?")) return;
    await fetch(`http://localhost:8080/api/${id}/admin`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });
    fetchUsers();
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
                <td>{Array.isArray(u.roles) ? u.roles.join(", ") : "—"}</td>
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
