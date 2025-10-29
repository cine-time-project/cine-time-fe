import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

export const CinemaTable = (data) => {
  const [cinemas, setCinemas] = useState([]);

  useEffect(() => {
    setCinemas(data);
  }, [data]);

  const imageBodyTemplate = (cinema) => {
    return (
      <img
        src={`${cinema.imageUrl}`}
        className="w-6rem shadow-2 border-round"
      />
    );
  };


  const header = (
    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
      <span className="text-xl text-900 font-bold">Cinemas</span>
      <Button icon="pi pi-refresh" rounded raised />
    </div>
  );
  const footer = `In total there are ${
    cinemas ? cinemas.length : 0
  } cinemas.`;

  return (
    <div className="card">
      <DataTable
        value={cinemas}
        header={header}
        footer={footer}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column field="name" header="Name"></Column>
        <Column header="Image" body={imageBodyTemplate}></Column>
        <Column field="price" header="Price"></Column>
        <Column field="category" header="Category"></Column>
        <Column
          field="rating"
          header="Reviews"
        ></Column>
        <Column field="status" header="Status"></Column>
      </DataTable>
    </div>
  );
};
