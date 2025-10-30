"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button, Form, Card } from "react-bootstrap";

export default function AdminUserNewPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    password: "",
    birthDate: "",
    gender: "OTHER",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:8080/api/users/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ ...form, role: "MEMBER" }),
      });

      if (!res.ok) throw new Error("Kullanıcı kaydedilemedi!");

      setSuccess("Kullanıcı başarıyla eklendi ✅");
      setTimeout(() => router.push(`/${locale}/admin/users`), 1200);
    } catch (err) {
      setError(err.message || "Bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <h1 className="section-title mb-3">Yeni Kullanıcı Ekle</h1>

      <Card className="p-3 shadow-sm">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Ad</Form.Label>
            <Form.Control
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Soyad</Form.Label>
            <Form.Control
              value={form.surname}
              onChange={(e) => setForm({ ...form, surname: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Telefon</Form.Label>
            <Form.Control
              placeholder="(555) 123-4567"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Şifre</Form.Label>
            <Form.Control
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Doğum Tarihi</Form.Label>
            <Form.Control
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Cinsiyet</Form.Label>
            <Form.Select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="MALE">Erkek</option>
              <option value="FEMALE">Kadın</option>
              <option value="OTHER">Diğer</option>
            </Form.Select>
          </Form.Group>

          {error && <p className="text-danger">{error}</p>}
          {success && <p className="text-success">{success}</p>}

          <div className="d-flex justify-content-between mt-4">
            <Button
              variant="secondary"
              onClick={() => router.push(`/${locale}/admin/users`)}
              disabled={loading}
            >
              Geri
            </Button>

            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: "#f26522", border: "none" }}
              disabled={loading}
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
