"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { config } from "@/helpers/config";
import { useTranslations } from "next-intl";

export default function NewUserPage() {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: "",
    birthDate: "",
    role: "MEMBER", // ✅ varsayılan rol
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const t = useTranslations("users");
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || config.apiURL;

  // 🔹 Telefon formatlama
  const formatPhone = (value) => {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("90")) digits = digits.substring(2);
    if (digits.startsWith("0")) digits = digits.substring(1);
    digits = digits.substring(0, 10);
    const match = digits.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return value;
    let formatted = "";
    if (match[1]) formatted = `(${match[1]}`;
    if (match[2]) formatted += `) ${match[2]}`;
    if (match[3]) formatted += `-${match[3]}`;
    return formatted;
  };

  // 🔹 Form değişimi
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
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      if (!token) {
        router.replace(`/${locale}/login`);
        return;
      }

      const formattedDate = form.birthDate
        ? new Date(form.birthDate).toISOString().split("T")[0]
        : "";

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
          phoneNumber: cleanPhone,
          gender: form.gender,
          birthDate: formattedDate,
          builtIn: false,
          roles: [form.role], // ✅ DÜZELTİLDİ
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("API Hatası:", data);
        alert(data.message || JSON.stringify(data) || t("errorMessage"));
        return;
      }

      sessionStorage.setItem("actionMessage", t("successMessage"));
      router.push(`/${locale}/admin/users`);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">{t("newTitle")}</h1>

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">{t("form.name")}</label>
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
          <label className="form-label">{t("form.surname")}</label>
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
          <label className="form-label">{t("form.email")}</label>
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
          <label className="form-label">{t("form.password")}</label>
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
          <label className="form-label">{t("form.phone")}</label>
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
          <label className="form-label">{t("form.gender")}</label>
          <select
            className="form-select"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
          >
            <option value="">{t("form.selectOption")}</option>
            <option value="MALE">{t("genders.MALE")}</option>
            <option value="FEMALE">{t("genders.FEMALE")}</option>
          </select>
        </div>

        {/* ✅ Rol seçimi */}
        <div className="mb-3">
          <label className="form-label">{t("form.role")}</label>
          <select
            className="form-select"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="MEMBER">{t("roles.MEMBER")}</option>
            <option value="EMPLOYEE">{t("roles.EMPLOYEE")}</option>
            <option value="ADMIN">{t("roles.ADMIN")}</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">{t("form.birthDate")}</label>
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
            {loading ? t("form.saving") : t("saveButton")}
          </button>

          <Link
            href={`/${locale}/admin/users`}
            className="btn btn-outline-secondary"
          >
            {t("backButton")}
          </Link>
        </div>
      </form>
    </div>
  );
}
