"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function NewUserPage() {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: "",
    birthDate: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  // 🔹 Telefonu daima (555) 123-4567 formatında döndürür
  const formatPhone = (value) => {
    // Sadece rakamları al
    let digits = value.replace(/\D/g, "");

    // Türk numaralarında baştaki ülke kodlarını temizle
    if (digits.startsWith("90")) digits = digits.substring(2);
    if (digits.startsWith("0")) digits = digits.substring(1);

    // Maksimum 10 haneli olacak şekilde kısalt
    digits = digits.substring(0, 10);

    // (555) 123-4567 formatına dönüştür
    const match = digits.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return value;

    let formatted = "";
    if (match[1]) formatted = `(${match[1]}`;
    if (match[2]) formatted += `) ${match[2]}`;
    if (match[3]) formatted += `-${match[3]}`;
    return formatted;
  };

  // 🔹 Form değişikliğinde otomatik format uygular
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "phoneNumber" ? formatPhone(value) : value,
    }));
  };

  // 🔹 Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.replace(`/${locale}/login`);
        return;
      }

      const formattedDate = form.birthDate
        ? new Date(form.birthDate).toISOString().split("T")[0]
        : "";

      // ✅ Sunucuya gitmeden önce numarayı son kez biçimlendir
      const cleanPhone = formatPhone(form.phoneNumber);

      const res = await fetch(`${API_BASE}/users/auth`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          surname: form.surname,
          email: form.email,
          password: form.password,
          phoneNumber: cleanPhone, // ✅ garantili biçimde (555) 123-4567
          gender: form.gender,
          birthDate: formattedDate,
          builtIn: false,
          role: "MEMBER",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("API Hatası:", data);
        alert(
          data.message || JSON.stringify(data) || "Kullanıcı ekleme başarısız."
        );
        return;
      }

      sessionStorage.setItem("actionMessage", "Kullanıcı başarıyla eklendi!");
      router.push(`/${locale}/admin/users`);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Yeni Kullanıcı Ekle</h1>

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Ad</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Soyad</label>
          <input
            type="text"
            className="form-control"
            name="surname"
            value={form.surname}
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
          <label className="form-label">Şifre</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Telefon</label>
          <input
            type="text"
            className="form-control"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="(555) 123-4567"
            maxLength={14}
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
            required
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
            required
          />
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ backgroundColor: "#f26522", border: "none" }}
          >
            {loading ? "Kaydediliyor..." : "Kaydet"}
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
