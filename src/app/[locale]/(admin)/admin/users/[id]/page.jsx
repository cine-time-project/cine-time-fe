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
    roles: [],
  });
  const router = useRouter();
  const { id } = useParams();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
   const API_BASE = process.env.NEXT_PUBLIC_API_BASE || config.apiURL;

  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");
    if (!token) {
      router.replace(`/${locale}/login`);
      return;
    }

    async function fetchUser() {
      try {
        const res = await fetch(`${API_BASE}/${id}/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Kullanıcı bulunamadı (Status: ${res.status})`);
        }

        const data = await res.json();

        setForm({
          firstName: data.name || "",
          lastName: data.surname || "",
          email: data.email || "",
          phone: data.phoneNumber || "",
          gender: data.gender || "",
          birthDate: data.birthDate || "",
          roles: data.roles || [],
        });
      } catch (err) {
        alert(err.message);
        router.push(`/${locale}/admin/users`);
      }
    }

    if (id) fetchUser();
  }, [id, locale, router, API_BASE]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "roles") {
      const updatedRoles = checked
        ? [...form.roles, value]
        : form.roles.filter((r) => r !== value);
      setForm({ ...form, roles: updatedRoles });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      // ✅ Backend ile birebir uyumlu body
      const res = await fetch(`${API_BASE}/${id}/admin`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          gender: form.gender,
          birthDate: form.birthDate
            ? new Date(form.birthDate).toISOString().split("T")[0]
            : null,
          roles: form.roles,
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
          <label className="form-label">Roller</label>
          <div className="d-flex gap-3">
            {["ADMIN", "EMPLOYEE", "MEMBER"].map((role) => (
              <div key={role} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="roles"
                  value={role}
                  id={`role-${role}`}
                  checked={form.roles.includes(role)}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor={`role-${role}`}>
                  {role}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Doğum Tarihi</label>
          <input
            type="date"
            className="form-control"
            name="birthDate"
            value={form.birthDate || ""}
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
