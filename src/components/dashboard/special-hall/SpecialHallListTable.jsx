"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Table, Button, Spinner, Pagination } from "react-bootstrap";
import { fetchSpecialHalls } from "@/service/special-hall-service";
import { deleteSpecialHallAction } from "@/action/special-hall-actions";
import { useTranslations } from "next-intl";

export default function SpecialHallListTable() {
  const tSH = useTranslations("specialHall");
  const tCommon = useTranslations("common");

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [data, setData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
  });
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

  const handleDelete = async (id) => {
    if (!confirm(tSH("confirmDelete"))) return;
    const res = await deleteSpecialHallAction(id);
    if (res?.ok) load();
  };

  // Type hücresini güvenli biçimde yaz
  const renderTypeCell = (row) => {
    const name =
      row.typeName ??
      row.type?.name ??
      row.type ?? // bazı eski BE sürümlerinde string olabilir
      row.specialTypeName ??
      "—";

    const pct = row.priceDiffPercent ?? row.type?.priceDiffPercent;
    return pct != null ? `${name} (+%${Number(pct)})` : name;
  };

  return (
    <div className="card shadow-sm border-0">
      {/* ÜST BAR: Başlık solda, New sağda */}
      <div className="card-header bg-transparent border-0 px-3 py-3">
        <div className="d-flex justify-content-between align-items-center gap-2">
          <h5 className="mb-0">{tSH("list.title")}</h5>
          <Link href="./special-halls/new" className="btn btn-warning">
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
            {(data?.content ?? []).map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>

                {/* Cinema */}
                <td>{row.cinemaName || `#${row.cinemaId}`}</td>

                {/* Type */}
                <td>{renderTypeCell(row)}</td>

                {/* Seat capacity */}
                <td>{row.seatCapacity ?? row.hallSeatCapacity ?? "-"}</td>

                {/* Actions */}
                <td className="text-end">
                  <div className="d-inline-flex gap-2">
                    <Link
                      href={`/dashboard/special-halls/${row.id}`}
                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center"
                      style={{ width: 32, height: 32 }}
                      aria-label={tCommon("edit")}
                      title={tCommon("edit")}
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
                      onClick={() => handleDelete(row.id)}
                    >
                      <i className="pi pi-trash" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {(!data?.content || data.content.length === 0) && (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  {tCommon("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Basit pagination */}
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
