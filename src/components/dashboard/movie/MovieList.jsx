"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { MovieToolbar } from "./MovieToolbar";
import { isAdmin } from "@/lib/utils/http";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslations } from "next-intl";

export const MovieList = ({data,locale,onPageChange,onSearch,onFilter,onDeleted,
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showButton, setShowButton] = useState(false);
  const t = useTranslations("movie");

  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    setAdmin(isAdmin());
  }, []);

  const handlePage = (e) => {
    const nextPage = e.page;
    onPageChange?.(nextPage);
  };

  const onSearchMovie = (search) => {
    setShowButton(true);
    onSearch(search);
  };

  const page = data?.returnBody ?? data ?? {};
  const { content = [], size = 10, totalElements = 0, number = 0 } = page;

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h3 className="m-0 fw-semibold text-dark">Movies</h3>

      {admin ? (
        <Link
          href={`/${locale}/admin/movies/new`}
          className="btn btn-warning text-dark fw-semibold"
        >
          <i className="pi pi-plus me-2" /> New
        </Link>
      ) : (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="tooltip-disabled">{t("needAdmin")}</Tooltip>
          }
        >
          <span
            className="btn btn-warning text-dark fw-semibold d-inline-block"
            style={{
              opacity: 0.6,
              cursor: "not-allowed",
              cursor: "not-allowed",
            }}
          >
            <i className="pi pi-plus me-2" /> New
          </span>
        </OverlayTrigger>
      )}
    </div>
  );

  const posterTemplate = (row) => {
    const poster =
      row.images?.find((img) => img.poster)?.url ||
      row.posterUrl ||
      "/no-poster.png";
    return (
      <img
        src={poster}
        alt={row.title}
        width="60"
        height="80"
        style={{
          objectFit: "cover",
          borderRadius: "4px",
          border: "1px solid #ddd",
        }}
      />
    );
  };

  const releaseDateTemplate = (row) =>
    row?.releaseDate
      ? new Date(row.releaseDate).toLocaleDateString(locale)
      : "-";

  const genreTemplate = (row) => {
    if (!Array.isArray(row.genre)) return row.genre || "-";

    const uniqueGenres = [...new Set(row.genre.map((g) => g.trim()))];
    return uniqueGenres.join(", ");
  };

  const ratingTemplate = (row) =>
    row.rating != null ? row.rating.toFixed(1) : "-";

  const handleClear = () => {
    setSearchTerm("");
    setStatusFilter("");
    onSearch?.("");
    onFilter?.("");
    onPageChange?.(0);
    setShowButton(false);
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <Container>
        {/* Search & Filter bar */}
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <Form.Control
            type="text"
            placeholder="Search (by title)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSearchMovie(searchTerm);
              }
            }}
            style={{ flex: "1 1 300px", minWidth: "250px" }}
          />

          {/* Search button */}
          <button
            type="button"
            className="btn btn-primary fw-semibold"
            onClick={() => onSearchMovie(searchTerm)}
            disabled={searchTerm === "" ? true : false}
          >
            <i className="pi pi-search me-2"></i>Search
          </button>

          <Col md="auto">
            {showButton && (
              <Button variant="outline-secondary" onClick={handleClear}>
                <i className="pi pi-times"></i> Show All Movies
              </Button>
            )}
          </Col>
        </div>

        {/* Movie Table */}
        <DataTable
          value={content}
          dataKey="id"
          paginator
          rows={size}
          totalRecords={totalElements}
          first={number * size}
          onPage={handlePage}
          lazy
          stripedRows
          showGridlines
          header={header}
          emptyMessage="No movies found."
          className="p-datatable-sm"
        >
          <Column
            header="#"
            body={(row, opt) => opt.rowIndex + 1 + number * size}
            style={{ width: "50px", textAlign: "center" }}
          />

          <Column
            header="Poster"
            body={posterTemplate}
            style={{ width: "80px", textAlign: "center" }}
          />

          <Column field="title" header="Title" style={{ width: "22%" }} />

          <Column
            field="status"
            header="Status"
            style={{ width: "10%", textAlign: "center" }}
          />

          <Column
            field="releaseDate"
            header="Release Date"
            body={releaseDateTemplate}
            style={{ width: "12%", textAlign: "center" }}
          />

          <Column
            field="duration"
            header="Duration (min)"
            style={{ width: "10%", textAlign: "center" }}
          />

          <Column
            field="rating"
            header="Rating"
            body={ratingTemplate}
            style={{ width: "8%", textAlign: "center" }}
          />

          <Column field="director" header="Director" style={{ width: "12%" }} />

          <Column
            header="Genre"
            body={genreTemplate}
            style={{ width: "15%" }}
          />

          <Column
            header="Actions"
            body={(row) => (
              <MovieToolbar
                row={row}
                locale={locale}
                onDeleted={() => onDeleted?.()}
                isAdmin={admin}
              />
            )}
            style={{ width: "10%", textAlign: "right" }}
          />
        </DataTable>
      </Container>
    </div>
  );
};
