"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Table, Button, Spinner, Pagination } from "react-bootstrap";
import { fetchSpecialHalls } from "@/service/special-hall-service";
import { deleteSpecialHallAction } from "@/action/special-hall-actions";

export default function SpecialHallListTable() {
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
      setData(
        resp || { content: [], totalPages: 0, totalElements: 0 }
      );
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const handleDelete = async (id) => {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
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
    <div className="card shadow-sm">
      <div className="card-body">
        {busy && (
          <div className="mb-2">
            <Spinner size="sm" /> Yükleniyor…
          </div>
        )}

        <Table striped hover responsive size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Cinema</th>
              <th>Type</th>
              <th>Seat Cap.</th>
              <th>Actions</th>
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
                <td className="d-flex gap-2">
                  <Link
                    href={`./special-halls/${row.id}`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    Edit
                  </Link>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(row.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}

            {(!data?.content || data.content.length === 0) && (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  Kayıt bulunamadı.
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
