"use client";

export default function ShowtimesTable({ rows, loading, onEdit, onDelete }) {
  const list = Array.isArray(rows) ? rows : [];

  return (
    <div className="table-responsive">
      <table className="table table-dark table-striped align-middle">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tarih</th>
            <th>Başlangıç</th>
            <th>Bitiş</th>
            <th>Salon</th>
            <th>Film</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="text-center py-4">Yükleniyor…</td></tr>
          ) : list.length === 0 ? (
            <tr><td colSpan={7} className="text-center py-4">Kayıt yok</td></tr>
          ) : (
            list.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.date || "—"}</td>
                <td>{r.startTime || "—"}</td>
                <td>{r.endTime || "—"}</td>
                <td>{r.hallName || "—"}</td>
                <td>{r.movieTitle || "—"}</td>
                <td className="d-flex gap-2">
                  <button className="btn btn-sm btn-primary" onClick={() => onEdit?.(r)}>Düzenle</button>
                  <button className="btn btn-sm btn-danger"  onClick={() => onDelete?.(r)}>Sil</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
