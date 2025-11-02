import React from "react";
import { Paginator } from "primereact/paginator";

/**
 * CinemaPagination
 * ----------------
 * Handles table pagination logic and UI.
 */
export const CinemaPagination = ({ currentPage, totalPages, rows, onPageChange }) => {
  const first = currentPage * rows;

  return (
    <Paginator
      first={first}
      rows={rows}
      totalRecords={totalPages * rows}
      onPageChange={(e) => onPageChange(e.page)}
      template="PrevPageLink PageLinks NextPageLink"
      className="mt-3"
    />
  );
};
