"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Container } from "react-bootstrap";
import { MovieToolbar } from "./MovieToolbar";

export const MovieList = ({ data, locale, onPageChange }) => {
  const router = useRouter();

  const handlePage = (e) => {
    const nextPage = e.page;
    onPageChange?.(nextPage);
  };

  const page = data?.returnBody ?? data ?? {};
  const { content = [], size = 10, totalElements = 0, number = 0 } = page;

  const onPage = (e) => router.push(`/${locale}/admin/movies?page=${e.page}`);

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h3 className="m-0 fw-semibold text-dark">Movies</h3>
      <Link
        href={`/${locale}/admin/movies/new`}
        className="btn btn-warning text-dark fw-semibold"
      >
        <i className="pi pi-plus me-2" /> New
      </Link>
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

  const genreTemplate = (row) =>
    Array.isArray(row.genre) ? row.genre.join(", ") : row.genre || "-";

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <Container>
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
            body={(row, opt) => opt.rowIndex + 1}
            style={{ width: "50px", textAlign: "center" }}
          />
          <Column
            header="Poster"
            body={posterTemplate}
            style={{ width: "80px" }}
          />
          <Column field="title" header="Title" style={{ width: "20%" }} />
          <Column field="status" header="Status" style={{ width: "10%" }} />
          <Column
            field="releaseDate"
            header="Release Date"
            body={releaseDateTemplate}
            style={{ width: "12%" }}
          />
          <Column
            field="duration"
            header="Duration (min)"
            style={{ width: "10%" }}
          />
          <Column field="rating" header="Rating" style={{ width: "8%" }} />
          <Column field="director" header="Director" style={{ width: "12%" }} />
          <Column
            header="Genre"
            body={genreTemplate}
            style={{ width: "15%" }}
          />
          <Column
            header="Actions"
            body={(row) => <MovieToolbar row={row} locale={locale} />}
            style={{ width: "10%", textAlign: "right" }}
          />
        </DataTable>
      </Container>
    </div>
  );
};
