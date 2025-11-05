"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl"; // ⬅️ EKLENDİ

import ShowtimesTable from "@/components/dashboard/showtimes/ShowtimesTable";
import ShowtimesSearchBar from "@/components/dashboard/showtimes/ShowtimesSearchBar";
import { listShowtimes, deleteShowtime } from "@/action/showtimes-actions";
import SectionTitle from "@/components/common/SectionTitle";

export default function ShowtimesListPage() {
  const router = useRouter();
  const locale = useLocale();

  // i18n
  const t  = useTranslations("showtimes");
  const tc = useTranslations("common");

  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    try {
      const m = document.cookie.match(/(?:^|;\s*)authRoles=([^;]+)/);
      const fromCookie = m ? decodeURIComponent(m[1]).split(/[\s,]+/) : [];
      const fromLS = JSON.parse(localStorage.getItem("authUser") || "{}");
      const arr = [...fromCookie, ...(fromLS.roles || fromLS.authorities || [])];
      const roles = new Set(arr.map((r) => String(r.name ?? r).replace(/^ROLE_/, "").toUpperCase()));
      setIsAdmin(roles.has("ADMIN"));
    } catch {}
  }, []);

  const [rows, setRows] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 20, total: 0, totalPages: 1 });

  const [filters, setFilters] = useState({
    cinemaId: undefined,
    hallId: undefined,
    movieId: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  });

  const query = useMemo(
    () => ({ page: pageInfo.page, size: pageInfo.size, ...filters }),
    [filters, pageInfo.page, pageInfo.size]
  );

  const fetchData = (q = query) =>
    startTransition(async () => {
      const res = await listShowtimes(q);
      setRows(res.content || []);
      setPageInfo((p) => ({
        ...p,
        total: res.totalElements ?? (res.content?.length || 0),
        totalPages: res.totalPages ?? 1,
      }));
    });

  useEffect(() => {
    fetchData(query);
    const h = () => fetchData(query);
    window.addEventListener("showtimes:changed", h);
    return () => window.removeEventListener("showtimes:changed", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (f) => {
    setFilters({
      cinemaId: f.cinemaId,
      hallId:   f.hallId,
      movieId:  f.movieId,
      dateFrom: f.dateFrom,
      dateTo:   f.dateTo,
    });
    setPageInfo((p) => ({ ...p, page: 0 }));
    fetchData({ ...f, page: 0, size: pageInfo.size });
  };

  const onClear = () => {
    setFilters({ cinemaId: undefined, hallId: undefined, movieId: undefined, dateFrom: undefined, dateTo: undefined });
    setPageInfo((p) => ({ ...p, page: 0 }));
    fetchData({ page: 0, size: pageInfo.size });
  };

  const onEdit = (row) => {
    if (!row?.id) return;
    router.push(`/${locale}/admin/showtimes/${row.id}`);
  };

  const onDelete = async (row) => {
    if (!row?.id) return;
    const ok = window.confirm(
      t("confirmDelete", { id: row.id, default: `#${row.id} screening will be deleted. Continue?` })
    );
    if (!ok) return;

    const res = await deleteShowtime(row.id);
    if (!res.ok) {
      alert(t("deleteError", { default: "An error occurred while deleting." }));
      return;
    }
    fetchData(query);
  };

  // Pagination
  const pageNumbers = useMemo(() => {
    const total = pageInfo.totalPages || 1;
    const cur = pageInfo.page || 0;
    const span = 5;
    let start = Math.max(0, cur - Math.floor(span / 2));
    let end = Math.min(total - 1, start + span - 1);
    start = Math.max(0, end - (span - 1));
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [pageInfo.page, pageInfo.totalPages]);

  function goPage(p) {
    if (p < 0 || p >= (pageInfo.totalPages || 1)) return;
    setPageInfo((prev) => ({ ...prev, page: p }));
    fetchData({ ...query, page: p, size: pageInfo.size });
  }
  function changeSize(sz) {
    const size = Number(sz) || 20;
    setPageInfo((prev) => ({ ...prev, page: 0, size }));
    fetchData({ ...query, page: 0, size });
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <SectionTitle align="center" textColor="text-light">
          {t("title", { default: "Showtimes" })}
        </SectionTitle>

        {mounted && isAdmin && (
          <button
            className="btn btn-warning"
            onClick={() => router.push(`/${locale}/admin/showtimes/new`)}
            disabled={isPending}
          >
            + {tc("new", { default: "New" })}
          </button>
        )}
      </div>

      <ShowtimesSearchBar initial={filters} onSearch={onSearch} onClear={onClear} />

      <ShowtimesTable
        rows={rows}
        loading={isPending}
        onEdit={onEdit}
        onDelete={onDelete}
        canEdit={isAdmin}
        canDelete={isAdmin}
      />

      {/* Pagination */}
      <div className="d-flex align-items-center justify-content-between mt-3">
        <div className="text-white-50 small">
          {tc("page", { default: "Page" })} <strong>{pageInfo.page + 1}</strong> / {pageInfo.totalPages || 1}
          {" · "}
          {tc("total", { default: "Total" })}: <strong>{pageInfo.total}</strong>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="text-white-50 small">{tc("rows", { default: "Rows" })}:</div>
          <select
            className="form-select form-select-sm"
            style={{ width: 90 }}
            value={pageInfo.size}
            onChange={(e) => changeSize(e.target.value)}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${pageInfo.page === 0 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goPage(0)} aria-label="First">«</button>
              </li>
              <li className={`page-item ${pageInfo.page === 0 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goPage(pageInfo.page - 1)} aria-label="Prev">‹</button>
              </li>

              {pageNumbers.map((n) => (
                <li key={n} className={`page-item ${n === pageInfo.page ? "active" : ""}`}>
                  <button className="page-link" onClick={() => goPage(n)}>{n + 1}</button>
                </li>
              ))}

              <li className={`page-item ${pageInfo.page >= (pageInfo.totalPages - 1 || 0) ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goPage(pageInfo.page + 1)} aria-label="Next">›</button>
              </li>
              <li className={`page-item ${pageInfo.page >= (pageInfo.totalPages - 1 || 0) ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goPage((pageInfo.totalPages || 1) - 1)} aria-label="Last">»</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
