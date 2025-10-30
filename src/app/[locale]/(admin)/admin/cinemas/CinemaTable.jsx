import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { Button as BootstrapButton } from "react-bootstrap";

export const CinemaTable = ({ data, currentPage, totalPages, onPageChange }) => {
  const [cinemas, setCinemas] = useState([]);
  const [first, setFirst] = useState(0); // DataTable için index
  const rows = 8; // sayfa başına kayıt sayısı

  useEffect(() => {
    setCinemas(data);
    setFirst(currentPage * rows); // DataTable indexi güncelle
  }, [data, currentPage]);

  const imageBodyTemplate = (cinema) => (
    <img src={cinema.imageUrl} className="w-6rem shadow-2 border-round" />
  );

  const actionBodyTemplate = (cinema) => (
    <div className="d-flex gap-2 justify-content-around">
      <BootstrapButton variant="success" size="sm">
        <i className="pi pi-file-edit"></i>
      </BootstrapButton>
      <BootstrapButton variant="danger" size="sm">
        <i className="pi pi-trash"></i>
      </BootstrapButton>
    </div>
  );

  const onPageChangeHandler = (event) => {
    const newPage = event.page; // 0-indexed
    onPageChange(newPage);
  };

  return (
    <div className="card">
      <DataTable value={cinemas} stripedRows tableStyle={{ minWidth: "50rem" }}>
        <Column field="id" header="ID"></Column>
        <Column field="name" header="Name"></Column>
        <Column body={imageBodyTemplate} header="Image"></Column>
        <Column body={(row) => row.city?.name || "-"} header="City"></Column>
        <Column body={(row) => row.country?.name || "-"} header="Country"></Column>
        <Column header="Actions" body={actionBodyTemplate}></Column>
      </DataTable>

      <Paginator
        first={first}
        rows={rows}
        totalRecords={totalPages * rows} // backend’den toplam sayfa * sayfa başı
        onPageChange={onPageChangeHandler}
        template="PrevPageLink PageLinks NextPageLink"
        className="mt-3"
      />
    </div>
  );
};
