import React from "react";
import { Button } from "react-bootstrap";

/**
 * CinemaRowActions
 * ----------------
 * Per-row action buttons (Edit, View, etc.)
 */
export const CinemaRowActions = ({ cinema }) => (
  <div className="d-flex justify-content-end">
    <Button variant="warning" size="sm">
      <i className="pi pi-file-edit"></i> Edit
    </Button>
  </div>
);
