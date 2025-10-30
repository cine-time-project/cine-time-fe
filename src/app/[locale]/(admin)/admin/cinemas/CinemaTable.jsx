import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { Button, Card } from "react-bootstrap";

export const CinemaTable = ({
  data,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [cinemas, setCinemas] = useState([]);
  const [first, setFirst] = useState(0);
  const rows = 8;
  const [selectedCinemas, setSelectedCinemas] = useState([]);

  useEffect(() => {
    setCinemas(data);
    setFirst(currentPage * rows);
  }, [data, currentPage]);

  const selectedCinemaCount = selectedCinemas.length;

  const header = (
    <div>
      <div className="text-dark h1">Cinemas</div>
      <div className="d-flex flex-wrap align-items-center justify-content-between">
        <div className="d-flex gap-2">
          <Button
            className="btn btn-danger"
            disabled={selectedCinemaCount === 0}
          >
            <i className="pi pi-trash"></i> Delete
            {selectedCinemaCount > 0 && (
              <span> - {selectedCinemaCount} Cinema(s)</span>
            )}
          </Button>
        </div>

        <Button className="btn btn-success">
          <i className="pi pi-plus"></i> New
        </Button>
      </div>
    </div>
  );

  const indexBodyTemplate = (rowData, options) => {
    return first + options.rowIndex + 1;
  };

  const imageBodyTemplate = (cinema) => (
    <Card.Img
      src={cinema.imageUrl}
      className="w-6rem shadow-2 border-round object-fit-cover"
      height={50}
    />
  );

  const hallBodyTemplate = (cinema) => {
    const halls = cinema?.hall
  }

  const actionBodyTemplate = (cinema) => (
    <div className="d-flex gap-5 justify-content-end">
      <Button className="btn btn-warning">
        <i className="pi pi-file-edit"></i> Edit
      </Button>
    </div>
  );

  const onPageChangeHandler = (event) => {
    const newPage = event.page;
    onPageChange(newPage);
  };

  return (
    <div className="card">
      <DataTable
        value={cinemas}
        header={header}
        dataKey="id"
        selectionMode="checkbox"
        selection={selectedCinemas}
        onSelectionChange={(e) => setSelectedCinemas(e.value)}
        stripedRows
        removableSort
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column
          header="#"
          body={indexBodyTemplate}
          style={{ width: "4rem", textAlign: "center" }}
          headerStyle={{ textAlign: "center" }}  
        />
        <Column body={imageBodyTemplate} header="Image" />
        <Column field="id" sortable header="ID" />
        <Column field="name" sortable header="Name" />
        <Column body={(row) => row.city?.name || "-"} sortable header="City" />
        <Column
          body={(row) => row.country?.name || "-"}
          sortable
          header="Country"
        />
        <Column body={actionBodyTemplate}></Column>
      </DataTable>

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
