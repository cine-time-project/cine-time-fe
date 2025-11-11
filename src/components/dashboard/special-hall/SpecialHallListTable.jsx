"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Table, Button, Spinner, Pagination } from "react-bootstrap";
import { useTranslations, useLocale } from "next-intl";
import { fetchSpecialHalls } from "@/service/special-hall-service";
import { deleteSpecialHallAction } from "@/action/special-hall-actions";
import { swAlert } from "@/helpers/sweetalert";


export default function SpecialHallListTable() {
  const tSH = useTranslations("specialHall");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const tSwal = useTranslations("swal");  
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const resp = await fetchSpecialHalls({ page, size, sort: "id,desc" });
      setData(resp || { content: [], totalPages: 0, totalElements: 0 });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  /* ---------------- helpers (field normalizasyonu) ---------------- */
  const pctOf = (v) => {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  };

  const getCinemaName = (row) =>
    row.cinemaName ??
    row.cinema?.name ??
    row.hall?.cinema?.name ??
    (row.cinemaId ? `#${row.cinemaId}` : "—");

  const getSeatCap = (row) =>
    row.seatCapacity ?? row.hallSeatCapacity ?? row.hall?.seatCapacity ?? "—";

  const getTypeName = (row) =>
    row.typeName ?? row.type?.name ?? row.type ?? row.specialTypeName ?? "—";

  const getTypePercent = (row) =>
    row.priceDiffPercent ??
    row.type?.priceDiffPercent ??
    row.typePercent ??
    row.surchargePercent ??
    row.percent ??
    row.diffPercent ??
    0;

  const renderTypeCell = (row) => {
    const name = getTypeName(row);
    const p = pctOf(getTypePercent(row));
    return p ? `${name} (+%${p})` : name;
  };

  /* ---------------- actions ---------------- */
   const handleDelete = async (row) => {
    const name =
      row?.hallName ||
      row?.hall?.name ||
      row?.typeName ||
      row?.type?.name ||
      row?.cinemaName ||
      `#${row?.id}`;

    // SweetAlert ile onay (başlık + açıklama)
    const ok = await swAlert(
      "question",
      tSwal("areYouSure"),
      tSH("confirmDelete", { name })
    );
    if (!ok) return;

    const res = await deleteSpecialHallAction(row.id);
    if (res?.ok) {
      await swAlert("success", tSH("messages.deleted"));
      load();
    } else {
      swAlert("error", tSH("messages.operationFailed"));
    }
  };

  const basePath = `/${locale}/admin/special-halls`;
  const newHref = `${basePath}/new`;

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-transparent border-0 px-3 py-3">
        <div className="d-flex justify-content-between align-items-center gap-2">
          <h5 className="mb-0">{tSH("list.title")}</h5>
          <Link href={newHref} className="btn btn-warning" prefetch>
            + {tCommon("new")}
          </Link>
        </div>
      </div>

      <div className="card-body">
        {busy && (
          <div className="mb-2">
            <Spinner size="sm" /> {tCommon("loading")}
          </div>
        )}

        <Table striped hover responsive size="sm" className="mb-3">
          <thead>
            <tr>
              <th>#</th>
              <th>{tSH("headers.cinema")}</th>
              <th>{tSH("headers.type")}</th>
              <th>{tSH("headers.seatCap")}</th>
              <th className="text-end">{tSH("columns.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {(data?.content ?? []).map((row) => {
              const editHref = `${basePath}/${row.id}`;
              return (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{getCinemaName(row)}</td>
                  <td>{renderTypeCell(row)}</td>
                  <td>{getSeatCap(row)}</td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <Link
                        href={editHref}
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32 }}
                        aria-label={tCommon("edit")}
                        title={tCommon("edit")}
                        prefetch
                      >
                        <i className="pi pi-file-edit" />
                      </Link>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="d-inline-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32 }}
                        aria-label={tCommon("delete")}
                        title={tCommon("delete")}
                        onClick={() => handleDelete(row)}
                      >
                        <i className="pi pi-trash" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {(!data?.content || data.content.length === 0) && (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  {tCommon("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {data?.totalPages > 1 && (
          <Pagination className="mb-0">
            <Pagination.Prev
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            />
            <Pagination.Item active>{page + 1}</Pagination.Item>
            <Pagination.Next
              disabled={page >= data.totalPages - 1}
              onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
            />
          </Pagination>
        )}
      </div>
    </div>
  );
}
