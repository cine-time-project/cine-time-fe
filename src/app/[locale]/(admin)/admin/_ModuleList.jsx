"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";

function hasAnyRole(userRoles = [], allowed = []) {
  if (!allowed?.length) return true;
  const set = new Set(userRoles.map(r => r?.toUpperCase?.() ?? r));
  return allowed.some(r => set.has(String(r).toUpperCase()));
}

/**
 * Props:
 *  - title: başlık
 *  - basePath: /tr/admin/users gibi
 *  - showNew: buton gösterilsin mi (varsayılan: true)
 *  - createRoles: "+ New" butonunu kimler görsün? (varsayılan: ["ADMIN"])
 *  - detailRoles: "Detay/Düzenle" linkini kimler görsün? (varsayılan: ["ADMIN"])
 */
export default function ModuleList({
  title,
  basePath,
  showNew = true,
  createRoles = ["ADMIN"],
  detailRoles = ["ADMIN"],
}) {
  const { roles = [] } = useAuth();
  const canCreate = hasAnyRole(roles, createRoles);
  const canDetail = hasAnyRole(roles, detailRoles);

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>{title}</h1>
        {showNew && canCreate && (
          <Link href={`${basePath}/new`} className="btn btn-primary">+ New</Link>
        )}
      </div>

      <div style={{ marginTop: 16, border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
        <p>Buraya tablo/filtre gelecek. Şimdilik örnek linkler:</p>
        <ul>
          {canDetail && (
            <li>
              <Link href={`${basePath}/123`}>Detay/Düzenle: 123</Link>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
