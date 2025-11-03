"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import Link from "next/link";

export default function EditUserPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    birthDate: "",
  });
  const router = useRouter();
  const { id } = useParams();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace(`/${locale}/login`);
      return;
    }

    async function fetchUser() {
      try {
        const res = await fetch(`${API_BASE}/users/4/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const u = Array.isArray(data)
          ? data.find((user) => user.id == id)
          : data?.returnBody?.content?.find((user) => user.id == id);

        if (!u) throw new Error("Kullanıcı bulunamadı.");

        setForm({
          firstName: u.name || "",
          lastName: u.surname || "",
          email: u.email || "",
          phone: u.phoneNumber || "",
          gender: u.gender || "",
          birthDate: u.birthDate || "",
        });
      } catch (err) {
        alert(err.message);
        router.push(`/${locale}/admin/users`);
      }
    }

    if (id) fetchUser();
  }, [id]);

  // Telefonu biçimlendir: (555) 123-4567
  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, "");
    const digits = cleaned.startsWith("90") ? cleaned.substring(2) : cleaned;

    const match = digits.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return value;

    let formatted = "";
    if (match[1]) formatted = `(${match[1]}`;
    if (match[2]) formatted += `) ${match[2]}`;
    if (match[3]) formatted += `-${match[3]}`;
    return formatted;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "phone" ? formatPhone(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(`${API_BASE}/${id}/admin`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.firstName,
          surname: form.lastName,
          email: form.email,
          phoneNumber: form.phone,
          gender: form.gender,
          birthDate: form.birthDate,
        }),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız.");

      sessionStorage.setItem(
        "actionMessage",
        "Kullanıcı başarıyla güncellendi!"
      );
      router.push(`/${locale}/admin/users`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Kullanıcı Düzenle</h1>

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Ad</label>
          <input
            type="text"
            className="form-control"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Soyad</label>
          <input
            type="text"
            className="form-control"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Telefon</label>
          <input
            type="text"
            className="form-control"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
            maxLength={14} // <-- sadece (XXX) XXX-XXXX
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Cinsiyet</label>
          <select
            className="form-select"
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">Seçiniz</option>
            <option value="MALE">Erkek</option>
            <option value="FEMALE">Kadın</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Doğum Tarihi</label>
          <input
            type="date"
            className="form-control"
            name="birthDate"
            value={form.birthDate}
            onChange={handleChange}
          />
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            style={{ backgroundColor: "#f26522", border: "none" }}
          >
            Kaydet
          </button>

          <Link
            href={`/${locale}/admin/users`}
            className="btn btn-outline-secondary"
          >
            ← Kullanıcılara Dön
          </Link>
        </div>
      </form>
    </div>
  );
}
