import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

/**
 * CinemaTableHeader
 * -----------------
 * Displays title and batch action buttons (Delete / New)
 */
export const CinemaTableHeader = ({
  selectedCount,
  onDelete,
  canCreate,
  canDelete,
}) => (
  <div className="d-flex flex-wrap align-items-center justify-content-between">
  
      {canDelete && (
        <Button
          variant="danger"
          disabled={selectedCount === 0}
          onClick={onDelete}
        >
          <i className="pi pi-trash"></i> Delete
          {selectedCount > 0 && <span> ({selectedCount})</span>}
        </Button>
      )}
      {canCreate && (
        <OverlayTrigger
          placement="bottom" // Tooltip position (top, right, bottom, left)
          overlay={<Tooltip id={`tooltip-new-cinema`}>Add New Cinema</Tooltip>}
        >
          <Button variant="success">
            <i className="pi pi-plus"></i>
          </Button>
        </OverlayTrigger>
      )}
    </div>
 
);
