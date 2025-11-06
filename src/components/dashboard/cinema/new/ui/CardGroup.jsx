import { Button as PrimeButton } from "primereact/button";
import { Button, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Prev } from "react-bootstrap/esm/PageItem";
import { FaEdit, FaRegEdit } from "react-icons/fa";

/**
 * CardGroup
 * ----------
 * Minimal & clean section container for form groups.
 * Provides clear visual separation without flashy design.
 */
export function CardGroup({ title, children, className = "" }) {
 
  return (
    <Card
      className={`mb-4 border rounded-4 shadow-sm ${className}`}
      style={{
        backgroundColor: "#fff",
        borderColor: "#e5e7eb", // soft grey border
      }}
    >
      {title && (
        <Card.Header
          className="bg-light border-bottom py-3 px-4"
          style={{
            borderTopLeftRadius: "1rem",
            borderTopRightRadius: "1rem",
          }}
        >
          <h6 className="mb-0 fw-semibold text-secondary fs-5">{title}</h6>
         
        </Card.Header>
      )}

      <Card.Body className="p-4">{children}</Card.Body>
    </Card>
  );
}
