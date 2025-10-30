"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button, Form, Card, Alert } from "react-bootstrap";

export default function AdminUserNewPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";

  // .env.local’daki backend URL
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    password: "",
    birthDate: "",
    gender: "OTHER",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/users/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          ...form,
          role: "MEMBER",
          builtIn: false,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Hata: ${res.status}`);
      }

      setSuccess("Kullanıcı başarıyla oluşturuldu ✅");
      setTimeout(() => router.push(`/${locale}/admin/users`), 1000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <h1 className="section-title mb-3">Yeni Kullanıcı Ekle</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

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
              required
            />
            <Form.Text className="text-muted">Format: (555) 123-4567</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Şifre</Form.Label>
            <Form.Control
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <Form.Text className="text-muted">
              En az 8 karakter, 1 büyük, 1 küçük, 1 rakam, 1 özel karakter.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Doğum Tarihi</Form.Label>
            <Form.Control
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              required
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

          <div className="d-flex justify-content-between">
            <Button
              variant="secondary"
              disabled={loading}
              onClick={() => router.push(`/${locale}/admin/users`)}
            >
              Geri
            </Button>
            <Button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: "var(--brand)", border: "none" }}
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
