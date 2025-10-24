"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { searchUsers, adminUpdateUser, adminDeleteUser } from "@/services/users-service";

export default function EditUserPage() {
  const { id } = useParams();
  const pathname = usePathname();
  const locale = useMemo(() => pathname.split("/")[1] || "tr", [pathname]);
  const router = useRouter();
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", phone:"" });
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await searchUsers({ q: id, page: 0, size: 1 });
        const u = res?.returnBody?.content?.[0] || res?.content?.[0];
        if (u) setForm({ firstName: u.firstName ?? "", lastName: u.lastName ?? "", email: u.email ?? "", phone: u.phone ?? "" });
      } catch(e){ setErr(e?.response?.data?.message || e?.message || "Hata"); }
    })();
  }, [id]);

  const save = async (e) => {
    e.preventDefault(); setMsg(""); setErr("");
    try { await adminUpdateUser(id, form); setMsg("Güncellendi"); }
    catch(e){ setErr(e?.response?.data?.message || e?.message || "Hata"); }
  };
  const del = async () => {
    if (!confirm("Silinsin mi?")) return;
    try { await adminDeleteUser(id); router.replace(`/${locale}/admin/users`); }
    catch(e){ setErr(e?.response?.data?.message || e?.message || "Hata"); }
  };

  return (
    <main className="container py-4" style={{maxWidth:720}}>
      <h1>Edit User #{id}</h1>
      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}
      <form onSubmit={save} className="row g-3">
        <div className="col-md-6"><label className="form-label">Ad</label><input className="form-control" value={form.firstName} onChange={e=>setForm(s=>({...s,firstName:e.target.value}))}/></div>
        <div className="col-md-6"><label className="form-label">Soyad</label><input className="form-control" value={form.lastName} onChange={e=>setForm(s=>({...s,lastName:e.target.value}))}/></div>
        <div className="col-md-6"><label className="form-label">E-posta</label><input type="email" className="form-control" value={form.email} onChange={e=>setForm(s=>({...s,email:e.target.value}))}/></div>
        <div className="col-md-6"><label className="form-label">Telefon</label><input className="form-control" value={form.phone} onChange={e=>setForm(s=>({...s,phone:e.target.value}))}/></div>
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-primary">Kaydet</button>
          <button type="button" onClick={del} className="btn btn-outline-danger">Sil</button>
        </div>
      </form>
    </main>
  );
}
