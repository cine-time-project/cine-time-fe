"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";

export default function AdminDashboardPage() {
  const { roles = [], loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";

  useEffect(() => {
    if (!loading && roles.length === 0) {
      router.replace(`/${locale}/login?redirect=${pathname}`);
    }
  }, [loading, roles, locale, pathname, router]);

  if (loading) return <p style={{ padding: 20 }}>Yükleniyor...</p>;

  // Rol kontrolü (Admin veya Employee dışındaki roller engellensin)
  if (!roles.includes("ADMIN") && !roles.includes("EMPLOYEE")) {
    return <p style={{ padding: 20 }}>Bu sayfaya erişim yetkiniz yok.</p>;
  }

  // Menü kartları
  const cards = [
    {
      title: "Cinemas",
      desc: "Şubeler ve salon eşleştirmeleri",
      link: `/${locale}/admin/cinemas`,
    },
    {
      title: "Halls",
      desc: "Salon planları, koltuk şablonları",
      link: `/${locale}/admin/halls`,
    },
    {
      title: "Showtimes",
      desc: "Seans planlama ve takvim",
      link: `/${locale}/admin/showtimes`,
    },
    {
      title: "Movies",
      desc: "Filmler ve içerik listesi",
      link: `/${locale}/admin/movies`,
    },
    {
      title: "Users",
      desc: "Kullanıcı arama ve yönetimi",
      link: `/${locale}/admin/users`,
    },
    {
      title: "Reports",
      desc: "Özetler ve performans raporları",
      link: `/${locale}/admin/reports`,
    },
    {
      title: "Payments",
      desc: "Ödeme kayıtları",
      link: `/${locale}/admin/payments`,
    },
    { title: "Roles", desc: "Rol ve yetkiler", link: `/${locale}/admin/roles` },
  ];

  return (
    <div style={{ padding: "40px" }}>
      <h1
        style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "30px" }}
      >
        Dashboard
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {cards.map((card) => (
          <a
            key={card.title}
            href={card.link}
            style={{
              display: "block",
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
              color: "#222",
              textDecoration: "none",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-3px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <h3 style={{ margin: "0 0 8px 0" }}>{card.title}</h3>
            <p style={{ margin: 0, color: "#666" }}>{card.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
