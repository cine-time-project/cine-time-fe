import { Button } from "primereact/button";
import React from "react";

/**
 * CinemaRowActions
 * ----------------
 * Per-row action buttons (Edit, View, etc.)
 */
export const CinemaRowActions = ({ cinema, handleDetail, translate }) => (
  <div className="d-flex justify-content-end">
      <Button
        link
        label={translate("details")}
        icon="pi pi-angle-right"
        iconPos="right"
        onClick={() => handleDetail(cinema.id)}
      />
  </div>
);
