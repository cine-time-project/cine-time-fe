import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

/**
 * CinemaRowActions
 * ----------------
 * Per-row action buttons (Edit, View, etc.)
 */
export const CinemaRowActions = ({ cinema, handleEdit }) => (
  <div className="d-flex justify-content-end">
    <OverlayTrigger
      placement="bottom" // Tooltip position (top, right, bottom, left)
      overlay={
        <Tooltip id={`tooltip-edit-${cinema.id}`}>Details</Tooltip>
      }
    >
      <Button variant="warning" onClick={() => handleEdit(cinema.id)}>
        <i className="pi pi-file-edit"></i>
      </Button>
    </OverlayTrigger>
  </div>
);
