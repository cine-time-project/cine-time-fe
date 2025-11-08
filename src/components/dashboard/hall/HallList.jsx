"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { HallToolbar } from "./HallToolbar";
import { useTranslations } from "next-intl";

/**
 * HallList component
 * @param {object} props
 * @param {object} props.data - Paginated hall data
 * @param {string} props.locale - Current locale
 * @param {function} props.onPageChange - Pagination handler
 * @param {function} props.onSearch - Search handler
 * @param {function} props.onDeleted - Refresh handler after delete
 */
export const HallList = ({
  data,
  locale,
  onPageChange,
  onSearch,
  onDeleted,
}) => {
  const router = useRouter();
  const t = useTranslations("hall");

  const [searchTerm, setSearchTerm] = useState("");
  const [showButton, setShowButton] = useState(false);

  const handlePage = (e) => {
    const nextPage = e.page;
    onPageChange?.(nextPage);
  };

  const handleSearch = () => {
    setShowButton(true);
    onSearch?.(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    setShowButton(false);
    onSearch?.("");
    onPageChange?.(0);
  };

  const page = data?.returnBody ?? data ?? {};
  const { content = [], size = 10, totalElements = 0, number = 0 } = page;

  // Table header
  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h3 className="m-0 fw-semibold text-dark">{t("listTitle")}</h3>
      <Link
        href={`/${locale}/admin/halls/new`}
        className="btn btn-warning text-dark fw-semibold"
      >
        <i className="pi pi-plus me-2" /> {t("newButton")}
      </Link>
    </div>
  );

  // Column templates
  const specialTemplate = (row) =>
    row.isSpecial ? (
      <span className="badge bg-success">{t("yes")}</span>
    ) : (
      <span className="badge bg-secondary">{t("no")}</span>
    );

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <Container>
        {/* Search bar */}
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <Form.Control
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            style={{ flex: "1 1 300px", minWidth: "250px" }}
          />

          <button
            id="ara"
            type="button"
            className="btn btn-primary fw-semibold"
            onClick={handleSearch}
            disabled={searchTerm.trim() === ""}
          >
            <i className="pi pi-search me-2"></i>
            {t("searchButton")}
          </button>

          <Col md="auto">
            {showButton && (
              <Button variant="outline-secondary" onClick={handleClear}>
                <i className="pi pi-times"></i> {t("showAllButton")}
              </Button>
            )}
          </Col>
        </div>

        {/* Hall Table */}
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
          emptyMessage={t("noData")}
          className="p-datatable-sm"
        >
          <Column
            header="#"
            body={(row, opt) => opt.rowIndex + 1 + number * size}
            style={{ width: "50px", textAlign: "left" }}
          />

          <Column
            field="cinemaName"
            header="Sinema Adı"
            style={{ width: "150px", textAlign: "left" }}
          />
          <Column
            field="id"
            header="ID"
            style={{ width: "100px", textAlign: "left" }}
          />

          <Column field="name" header={t("name")} style={{ width: "100px" }} />
          <Column
            field="seatCapacity"
            header={t("seatCapacity")}
            style={{ width: "100px", textAlign: "left" }}
          />
          <Column
            field="isSpecial"
            header={t("isSpecial")}
            body={specialTemplate}
            style={{ width: "100px", textAlign: "left" }}
          />
          <Column
            header={t("actions")}
            body={(row) => (
              <HallToolbar row={row} locale={locale} onDeleted={onDeleted} />
            )}
            style={{ width: "5%", textAlign: "left" }}
          />
        </DataTable>
      </Container>
    </div>
  );
};
