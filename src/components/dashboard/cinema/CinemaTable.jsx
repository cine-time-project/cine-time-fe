import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { CinemaTableHeader } from "./CinemaTableHeader";
import { CinemaImage } from "./CinemaImage";
import { CinemaRowActions } from "./CinemaRowActions";
import { CinemaPagination } from "./CinemaPagination";
import { useRouter } from "next/navigation";

/**
 * CinemaTable
 * ------------
 * Presentational component for displaying cinema data.
 * Handles:
 * - Selection
 * - Row templates
 * - Pagination (delegated)
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

  const handleBatchDelete = async () => {
    await onDelete(selectedCinemas.map((c) => c.id));
    setSelectedCinemas([]);
  };

  const handleDetail = (id) => router.push(`/${locale}/admin/cinemas/${id}`);

  const handleCreate = (id) => router.push(`/${locale}/admin/cinemas/new`);

  const indexBody = (_, { rowIndex }) => first + rowIndex + 1;

  return (
    <div className="card">
      <DataTable
        value={data}
        dataKey="id"
        selection={selectedCinemas}
        onSelectionChange={(e) => setSelectedCinemas(e.value)}
        stripedRows
        removableSort
        header={
          <CinemaTableHeader
            selectedCount={selectedCinemas.length}
            onDelete={handleBatchDelete}
            onCreate={handleCreate}
            canCreate={canCreate}
            canDelete={canDelete}
            translate={translate}
          />
        }
        tableStyle={{ minWidth: "60rem" }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column header="#" body={indexBody} style={{ width: "4rem" }} />
        <Column
          header={translate("image")}
          body={(row) => <CinemaImage url={row.imageUrl} />}
        />
        <Column field="id" header="ID" sortable />
        <Column field="name" header={translate("name")} sortable />
        <Column body={(r) => r.city?.name || "-"} header={translate("city")} sortable />
        <Column
          body={(r) => r.country?.name || "-"}
          header={translate("country")}
          sortable
        />
        <Column
            body={(r) => (
              <CinemaRowActions cinema={r} handleDetail={handleDetail} translate={translate} />
            )}
          />
        
      </DataTable>

      <CinemaPagination
        currentPage={currentPage}
        totalPages={totalPages}
        rows={rows}
        onPageChange={onPageChange}
      />
    </div>
  );
};
