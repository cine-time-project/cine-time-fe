import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

/**
 * CinemaRowActions
 * ----------------
 * Per-row action buttons (Edit, View, etc.)
 */
export const CinemaRowActions = ({ cinema }) => (
  <div className="d-flex justify-content-end">
    <OverlayTrigger
      placement="bottom" // Tooltip position (top, right, bottom, left)
      overlay={
        <Tooltip id={`tooltip-edit-${cinema.id}`}>Edit this cinema</Tooltip>
      }
    >
      <Button variant="warning">
        <i className="pi pi-file-edit"></i>
      </Button>
    </OverlayTrigger>
  </div>
);
