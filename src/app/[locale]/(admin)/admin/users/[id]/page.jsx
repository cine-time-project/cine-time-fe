"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useMemo(() => pathname.split("/")[1] || "tr", [pathname]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "OTHER",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  
  const formatPhone = (phone) => {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, ""); // sadece rakamlar
    if (cleaned.startsWith("90")) cleaned = cleaned.slice(2);
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
    return phone;
  };

  // Kullanıcı bilgilerini çek
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Giriş yapılmadı.");

        const res = await fetch(
          `http://localhost:8090/api/users/admin?q=${id}`,
          {
            headers: { Authorization: "Bearer " + token },
          }
        );

        if (!res.ok) throw new Error("Kullanıcı bulunamadı.");

        const data = await res.json();
        const u = data?.returnBody?.content?.find((user) => user.id == id);
        if (!u) throw new Error("Kullanıcı bulunamadı.");

        setForm({
          firstName: u.name || "",
          lastName: u.surname || "",
          email: u.email || "",
          phone: formatPhone(u.phoneNumber),
          birthDate: u.birthDate || "",
          gender: u.gender || "OTHER",
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };
    fetchUser();
  }, [id]);

  // Kaydet (Güncelleme)
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Giriş yapılmadı.");

      let formattedDate = form.birthDate;
      if (formattedDate.includes(".")) {
        const [day, month, year] = formattedDate.split(".");
        formattedDate = `${year}-${month}-${day}`;
      }

      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: formatPhone(form.phone),
        birthDate: formattedDate || null,
        gender: form.gender,
      };

      const res = await fetch(`http://localhost:8090/api/${id}/admin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Backend hata:", txt);
        throw new Error("Güncelleme başarısız.");
      }

      setSuccess("✅ Kullanıcı başarıyla güncellendi!");
      setTimeout(() => router.push(`/${locale}/admin/users`), 1500);
    } catch (err) {
      setError(err.message || "Bir hata oluştu.");
    }
  };

  return (
    <main className="container py-4" style={{ maxWidth: 720 }}>
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
      `}</style>

      <h1 className="mb-3 text-light">Kullanıcı Düzenle #{id}</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSave} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Ad</label>
          <input
            className="form-control"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Soyad</label>
          <input
            className="form-control"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Telefon</label>
          <input
            className="form-control"
            placeholder="(555) 999-6611"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Doğum Tarihi</label>
          <input
            type="date"
            className="form-control"
            value={form.birthDate || ""}
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
            className="btn btn-secondary"
            onClick={() => router.push(`/${locale}/admin/users`)}
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
