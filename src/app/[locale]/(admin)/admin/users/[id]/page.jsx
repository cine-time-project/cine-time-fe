"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Card, Form, Button } from "react-bootstrap";
import {
  searchUsers,
  adminUpdateUser,
  adminDeleteUser,
} from "@/services/users-service";

export default function EditUserPage() {
  const { id } = useParams();
  const pathname = usePathname();
  const locale = useMemo(() => pathname.split("/")[1] || "tr", [pathname]);
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "OTHER",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Kullanıcı bilgilerini getir ---
  useEffect(() => {
    (async () => {
      try {
        const res = await searchUsers({ q: id, page: 0, size: 1 });
        const u = res?.returnBody?.content?.[0] || res?.content?.[0];

        if (!u) {
          setErr("Kullanıcı bulunamadı.");
          return;
        }

        setForm({
          firstName: u.name ?? "",
          lastName: u.surname ?? "",
          email: u.email ?? "",
          phone: u.phoneNumber ?? "",
          birthDate: u.birthDate ?? "",
          gender: u.gender ?? "OTHER",
        });
      } catch (e) {
        console.error(e);
        setErr(
          e.response?.data?.message ||
            e.message ||
            "Kullanıcı bilgisi alınamadı."
        );
      }
    })();
  }, [id]);

  // --- Kaydet ---
  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);
    try {
      await adminUpdateUser(id, form);
      setMsg("✅ Kullanıcı başarıyla güncellendi!");
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.message || e.message || "Güncelleme hatası");
    } finally {
      setLoading(false);
    }
  };

  // --- Sil ---
  const del = async () => {
    if (!confirm("Bu kullanıcı silinsin mi?")) return;
    setMsg("");
    setErr("");
    setLoading(true);
    try {
      await adminDeleteUser(id);
      router.replace(`/${locale}/admin/users`);
    } catch (e) {
      console.error(e);
      setErr(
        e.response?.data?.message || e.message || "Silme işlemi başarısız"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <Button
        variant="outline-secondary"
        size="sm"
        className="mb-3"
        onClick={() => router.push(`/${locale}/admin/users`)}
      >
        ← Kullanıcı listesine dön
      </Button>

      <h1 className="section-title mb-3">Kullanıcı Düzenle #{id}</h1>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}

      <Card className="p-4 shadow-sm">
        <Form onSubmit={save}>
          <Form.Group className="mb-3">
            <Form.Label>Ad</Form.Label>
            <Form.Control
              value={form.firstName}
              onChange={(e) =>
                setForm((s) => ({ ...s, firstName: e.target.value }))
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Soyad</Form.Label>
            <Form.Control
              value={form.lastName}
              onChange={(e) =>
                setForm((s) => ({ ...s, lastName: e.target.value }))
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>E-posta</Form.Label>
            <Form.Control
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((s) => ({ ...s, email: e.target.value }))
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Telefon</Form.Label>
            <Form.Control
              value={form.phone}
              onChange={(e) =>
                setForm((s) => ({ ...s, phone: e.target.value }))
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Doğum Tarihi</Form.Label>
            <Form.Control
              type="date"
              value={form.birthDate}
              onChange={(e) =>
                setForm((s) => ({ ...s, birthDate: e.target.value }))
              }
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Cinsiyet</Form.Label>
            <Form.Select
              value={form.gender}
              onChange={(e) =>
                setForm((s) => ({ ...s, gender: e.target.value }))
              }
            >
              <option value="MALE">Erkek</option>
              <option value="FEMALE">Kadın</option>
              <option value="OTHER">Diğer</option>
            </Form.Select>
          </Form.Group>

          {/* 🔹 Butonlar */}
          <div className="d-flex justify-content-between mt-4">
            <Button
              type="button"
              variant="outline-danger"
              onClick={del}
              disabled={loading}
            >
              Sil
            </Button>

            <Button
              type="submit"
              style={{
                backgroundColor: "#f26522",
                border: "none",
                padding: "6px 20px",
                borderRadius: "6px",
              }}
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
