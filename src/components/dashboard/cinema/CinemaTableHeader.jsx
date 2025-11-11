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
  onCreate,
  canCreate,
  canDelete,
  translate
}) => (
  <div className="d-flex flex-wrap align-items-center justify-content-between">
  
      {canDelete && (
        <Button
          variant="danger"
          disabled={selectedCount === 0}
          onClick={onDelete}
        >
          <i className="pi pi-trash"></i> {translate("delete")}
          {selectedCount > 0 && <span> ({selectedCount})</span>}
        </Button>
      )}
      {canCreate && (
        <OverlayTrigger
          placement="bottom" // Tooltip position (top, right, bottom, left)
          overlay={<Tooltip id={`tooltip-new-cinema`}>{translate("addNewCinema")}</Tooltip>}
        >
          <Button variant="success" onClick={onCreate}>
            <i className="pi pi-plus"></i>
          </Button>
        </OverlayTrigger>
      )}
    </div>
 
);
