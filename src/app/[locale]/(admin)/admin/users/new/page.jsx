"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function NewUserPage() {
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Giriş yapılmadı.");

      // 🔹 Doğum tarihini yyyy-MM-dd formatına dönüştür
      let formattedDate = form.birthDate;
      if (formattedDate.includes(".")) {
        const [day, month, year] = formattedDate.split(".");
        formattedDate = `${year}-${month}-${day}`;
      }

      // 🔹 Backend'e uygun payload
      const payload = {
        name: form.name,
        surname: form.surname,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        birthDate: formattedDate,
        gender: form.gender,
      };

      const res = await fetch("http://localhost:8090/api/users/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Backend hata:", txt);
        throw new Error("Kullanıcı ekleme başarısız.");
      }

      setSuccess("✅ Yeni kullanıcı başarıyla eklendi!");
      setTimeout(() => router.push(`/${locale}/admin/users`), 1500);
    } catch (err) {
      setError(err.message || "Bir hata oluştu.");
    }
  };

  return (
    <main className="container py-4" style={{ maxWidth: 720 }}>
      {/* Stil düzenlemeleri */}
      <style jsx global>{`
        label.form-label {
          color: #fff !important;
          font-weight: 500;
        }
        input,
        select {
          background-color: #222 !important;
          color: #fff !important;
          border: 1px solid #555 !important;
        }
        input::placeholder {
          color: #bbb !important;
        }
      `}</style>

      <h1 className="mb-3 text-light">Yeni Kullanıcı Ekle</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSave} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Ad</label>
          <input
            className="form-control"
            placeholder="Kullanıcının adı"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Soyad</label>
          <input
            className="form-control"
            placeholder="Kullanıcının soyadı"
            value={form.surname}
            onChange={(e) => setForm({ ...form, surname: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="ornek@mail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Telefon</label>
          <input
            className="form-control"
            placeholder="(555) 999-6611"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Şifre</label>
          <input
            type="password"
            className="form-control"
            placeholder="Parola"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Doğum Tarihi</label>
          <input
            type="date"
            className="form-control"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Cinsiyet</label>
          <select
            className="form-select"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="MALE">Erkek</option>
            <option value="FEMALE">Kadın</option>
            <option value="OTHER">Diğer</option>
          </select>
        </div>

        <div className="col-12 d-flex justify-content-between mt-3">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/admin/users`)}
            className="btn btn-secondary"
          >
            Geri
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ backgroundColor: "#f26522", border: "none" }}
          >
            Kaydet
          </button>
        </div>
      </form>
    </main>
  );
}
