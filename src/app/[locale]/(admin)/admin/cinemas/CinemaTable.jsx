import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { Button, Card } from "react-bootstrap";

/**
 * CinemaTable Component
 * - Displays a list of cinemas in a table
 * - Supports selection via checkboxes for batch deletion
 * - Handles pagination via parent callbacks
 * - Uses parent `onDelete` function to perform deletion
 *
 * @param {Array} data - List of cinemas from parent component
 * @param {number} currentPage - Current page index (0-indexed)
 * @param {number} totalPages - Total pages available
 * @param {function} onPageChange - Callback to fetch data for a new page
 * @param {function} onDelete - Callback to delete selected cinemas
 */
export const CinemaTable = ({
  data,
  currentPage,
  totalPages,
  onPageChange,
  onDelete,
}) => {
  // State to track selected cinemas via checkboxes
  const [selectedCinemas, setSelectedCinemas] = useState([]);

  // Number of rows per page
  const rows = 8;

  // Index of first item on current page (used for row numbering)
  const first = currentPage * rows;

  // Count of selected cinemas
  const selectedCinemaCount = selectedCinemas.length;

  /**
   * Header template including table title, batch delete button, and "New" button
   */
  const header = (
    <div>
      <div className="text-dark h1">Cinemas</div>
      <div className="d-flex flex-wrap align-items-center justify-content-between">
        <div className="d-flex gap-2">
          {/* Batch delete button */}
          <Button
            className="btn btn-danger"
            disabled={selectedCinemaCount === 0} // disabled if nothing selected
            onClick={async () => {
              try {
                // Call parent deletion handler with selected IDs
                await onDelete(selectedCinemas.map((cinema) => cinema.id));
                // Clear selection after successful deletion
                setSelectedCinemas([]);
              } catch (err) {
                console.error("Failed to delete cinemas:", err);
                // Optionally show a toast or alert here
              }
            }}
          >
            <i className="pi pi-trash"></i> Delete
            {selectedCinemaCount > 0 && (
              <span> - {selectedCinemaCount} Cinema(s)</span>
            )}
          </Button>
        </div>

        {/* New cinema button */}
        <Button className="btn btn-success">
          <i className="pi pi-plus"></i> New
        </Button>
      </div>
    </div>
  );

  /**
   * Row index template for numbering
   * @param {object} rowData - Cinema row data
   * @param {object} options - DataTable options, contains rowIndex
   */
  const indexBodyTemplate = (rowData, options) => {
    return first + options.rowIndex + 1;
  };

  /**
   * Template for displaying cinema image
   * @param {object} cinema
   */
  const imageBodyTemplate = (cinema) => (
    <Card.Img
      src={cinema.imageUrl}
      className="w-6rem shadow-2 border-round object-fit-cover"
      height={50}
    />
  );

  /**
   * Template for displaying halls (optional, currently placeholder)
   * @param {object} cinema
   */
  const hallBodyTemplate = (cinema) => {
    const halls = cinema?.hall || [];
    return halls.length > 0 ? halls.map((h) => h.name).join(", ") : "-";
  };

  /**
   * Template for action buttons per row (edit only in current setup)
   * @param {object} cinema
   */
  const actionBodyTemplate = (cinema) => (
    <div className="d-flex gap-5 justify-content-end">
      <Button className="btn btn-warning">
        <i className="pi pi-file-edit"></i> Edit
      </Button>
    </div>
  );

  /**
   * Handler for pagination changes
   * @param {object} event - contains new page index
   */
  const onPageChangeHandler = (event) => {
    onPageChange(event.page);
  };

  return (
    <div className="card">
      {/* DataTable from PrimeReact */}
      <DataTable
        value={data} // use parent data directly
        header={header}
        dataKey="id" // unique key for each row
        selectionMode="checkbox" // enable row selection via checkboxes
        selection={selectedCinemas} // selected rows
        onSelectionChange={(e) => setSelectedCinemas(e.value)} // update selection
        stripedRows
        removableSort
        tableStyle={{ minWidth: "50rem" }}
      >
        {/* Checkbox column for multi-selection */}
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />

        {/* Row index */}
        <Column
          header="#"
          body={indexBodyTemplate}
          style={{ width: "4rem", textAlign: "center" }}
          headerStyle={{ textAlign: "center" }}
        />

        {/* Image column */}
        <Column body={imageBodyTemplate} header="Image" />

        {/* Cinema ID and Name */}
        <Column field="id" sortable header="ID" />
        <Column field="name" sortable header="Name" />

        {/* City & Country */}
        <Column body={(row) => row.city?.name || "-"} sortable header="City" />
        <Column
          body={(row) => row.country?.name || "-"}
          sortable
          header="Country"
        />

        {/* Action buttons */}
        <Column body={actionBodyTemplate}></Column>
      </DataTable>

      {/* Pagination */}
      <Paginator
        first={first}
        rows={rows}
        totalRecords={totalPages * rows}
        onPageChange={onPageChangeHandler}
        template="PrevPageLink PageLinks NextPageLink"
        className="mt-3"
      />
    </div>
  );
};
