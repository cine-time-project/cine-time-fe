// src/components/dashboard/showtimes/ShowtimesTable.jsx
"use client";

import styles from "./showtimes-table.module.scss";

export default function ShowtimesTable({
  rows = [],
  loading = false,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}) {
  const list = Array.isArray(rows) ? rows : [];
  const showActions = canEdit || canDelete;

  const makeKey = (r, i) =>
    r?._key ||
    r?.id ||
    [r.hallId, r.movieId, r.date, r.startTime, i].filter(Boolean).join("-");

  return (
    <div className="table-responsive position-relative">
      {loading && (
        <div
          className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ inset: 0, background: "rgba(255,255,255,.6)", backdropFilter: "blur(1px)" }}
        >
          Yükleniyor…
        </div>
      )}

      <table className="table table-dark table-striped align-middle m-0">
        <thead className="text-white">
          <tr>
            <th>ID</th>
            <th>Tarih</th>
            <th>Başlangıç</th>
            <th>Bitiş</th>
            <th>Salon</th>
            <th>Film</th>
            {showActions && <th style={{ width: 160 }}>İşlemler</th>}
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 7 : 6} className="text-center py-4">
                Kayıt yok
              </td>
            </tr>
          ) : (
            list.map((r, i) => {
              const hasId = Number.isFinite(r?.id);
              return (
                <tr key={makeKey(r, i)}>
                  <td>{hasId ? r.id : "—"}</td>
                  <td>{r.date || "—"}</td>
                  <td>{r.startTime || "—"}</td>
                  <td>{r.endTime || "—"}</td>
                  <td>{r.hallName || "—"}</td>
                  <td>{r.movieTitle || "—"}</td>

                  {showActions && (
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          type="button"
                          className={`btn btn-secondary ${styles.iconBtn}`}
                          title="Düzenle"
                          onClick={() => hasId && onEdit?.(r)}
                          disabled={!canEdit || !hasId}
                        >
                          <i className="pi pi-file-edit" />
                        </button>
                        <button
                          type="button"
                          className={`btn btn-secondary ${styles.iconBtn}`}
                          title="Sil"
                          onClick={() => hasId && onDelete?.(r)}
                          disabled={!canDelete || !hasId}
                        >
                          <i className="pi pi-trash" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
