import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { CinemaImage } from "./CinemaImage";
import { CinemaRowActions } from "./CinemaRowActions";
import { CinemaPagination } from "./CinemaPagination";
import { useRouter } from "next/navigation";

/**
 * CinemaTable
 * ------------
 * Displays a table of cinemas with images, actions, and pagination.
 * - Supports multi-selection and batch deletion
 * - Allows navigation to detail and create pages
 * - Integrates pagination controls
 */
export const CinemaTable = ({
  data,
  currentPage,
  totalPages,
  onPageChange,
  onDelete,
  canCreate,
  canDelete,
  locale,
  translate,
  rows = 10,
}) => {
  const [selectedCinemas, setSelectedCinemas] = useState([]);
  const first = currentPage * rows;
  const router = useRouter();

  /** Navigate to cinema detail page */
  const handleDetail = (id) => router.push(`/${locale}/admin/cinemas/${id}`);

  /** Navigate to create cinema page */
  const handleCreate = () => router.push(`/${locale}/admin/cinemas/new`);

  /** Delete selected cinemas in batch */
  const handleBatchDelete = async () => {
    await onDelete(selectedCinemas.map((c) => c.id));
    setSelectedCinemas([]);
  };

  /** Renders the index number for each row */
  const indexBody = (_, { rowIndex }) => first + rowIndex + 1;

  /**
   * Inline header section (previously CinemaTableHeader)
   * ----------------------------------------------------
   * Displays action buttons for "Delete" and "Add New Cinema"
   */
  const renderTableHeader = () => (
    <div className="d-flex flex-wrap align-items-center justify-content-between">
      {/* Delete Button */}
      {canDelete && (
        <Button
          variant="danger"
          disabled={selectedCinemas.length === 0}
          onClick={handleBatchDelete}
        >
          <i className="pi pi-trash"></i> {translate("delete")}
          {selectedCinemas.length > 0 && (
            <span> ({selectedCinemas.length})</span>
          )}
        </Button>
      )}

      {/* Add New Cinema Button with Tooltip */}
      {canCreate && (
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id="tooltip-new-cinema">
              {translate("addNewCinema")}
            </Tooltip>
          }
        >
          <Button variant="success" onClick={handleCreate}>
            <i className="pi pi-plus"></i>
          </Button>
        </OverlayTrigger>
      )}
    </div>
  );

  return (
    <div className="card">
      <DataTable
        value={data}
        dataKey="id"
        selection={selectedCinemas}
        onSelectionChange={(e) => setSelectedCinemas(e.value)}
        stripedRows
        removableSort
        header={renderTableHeader()} // inline header instead of separate component
        tableStyle={{ minWidth: "60rem" }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column header="#" body={indexBody} style={{ width: "4rem" }} />
        <Column
          header={translate("image")}
          body={(row) => <CinemaImage url={row?.cinemaImageUrl || row?.imageUrl} />}
        />
        <Column field="id" header="ID" sortable />
        <Column field="name" header={translate("name")} sortable />
        <Column
          body={(r) => r.city?.name || "-"}
          header={translate("city")}
          sortable
        />
        <Column
          body={(r) => r.country?.name || "-"}
          header={translate("country")}
          sortable
        />
        <Column
          body={(r) => (
            <CinemaRowActions
              cinema={r}
              handleDetail={handleDetail}
              translate={translate}
            />
          )}
        />
      </DataTable>

      {/* Pagination Component */}
      <CinemaPagination
        currentPage={currentPage}
        totalPages={totalPages}
        rows={rows}
        onPageChange={onPageChange}
      />
    </div>
  );
};
