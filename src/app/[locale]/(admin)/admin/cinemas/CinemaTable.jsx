"use client";
import React, { useState, useEffect } from "react";

import { Column } from "primereact/column";

import { DataTable } from "primereact/datatable";
import { Button as BootstrapButton } from "react-bootstrap";
import { Button } from "primereact/button";

export const CinemaTable = ({ data }) => {
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
    <div className="flex flex-wrap align-items-center justify-content-between">
      <span className="d-block text-xl text-900 font-bold">Cinemas</span>
      <Button icon="pi pi-refresh" rounded raised />
    </div>
  );

  const footer = `In total there are ${cinemas ? cinemas.length : 0} cinemas.`;

  // Action buttons for each row
  const actionBodyTemplate = (cinema) => (
    <div className="d-flex gap-2 justify-content-around">
      <BootstrapButton
        variant="success"
        size="sm"
        onClick={() => onEdit?.(cinema)}
      >
        <i className="pi pi-file-edit"></i>
      </BootstrapButton>
      <BootstrapButton
        variant="danger"
        size="sm"
        onClick={() => onDelete?.(cinema)}
      >
        <i className="pi pi-trash"></i>
      </BootstrapButton>
    </div>
  );

  return (
    <div className="card">
      <DataTable
        stripedRows
        value={cinemas}
        header={header}
        footer={footer}
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column field="id" header="ID"></Column>
        <Column field="name" header="Name"></Column>
        <Column body={imageBodyTemplate} header="Image"></Column>
        <Column body={(row) => row.city?.name || "-"} header="City"></Column>
        <Column
          body={(row) => row.country?.name || "-"}
          header="Country"
        ></Column>
        <Column header="Actions" body={actionBodyTemplate} />
        {/* <Column header="Image" body={imageBodyTemplate}></Column>
        <Column field="price" header="Price"></Column>
        <Column field="category" header="Category"></Column>
        <Column
          field="rating"
          header="Reviews"
        ></Column>
        <Column field="status" header="Status"></Column> */}
      </DataTable>
    </div>
  );
};
