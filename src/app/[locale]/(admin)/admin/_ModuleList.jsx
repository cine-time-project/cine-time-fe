"use client";

import Link from "next/link";

export default function ModuleList({ title, basePath, locale }) {
  return (
    <section>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <h1 style={{ margin: 0 }}>{title}</h1>
        <Link href={`${basePath}/new`} className="btn btn-primary">+ New</Link>
      </div>

      <div style={{ marginTop: 16, border:"1px solid #e5e7eb", borderRadius:8, padding:16 }}>
        <p>Buraya tablo/filtre gelecek. Şimdilik örnek linkler:</p>
        <ul>
          <li>
            <Link href={`${basePath}/123`}>Detay/Düzenle: 123</Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
