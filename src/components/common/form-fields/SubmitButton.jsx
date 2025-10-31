"use client";

import { Button } from "react-bootstrap";

export const SubmitButton = ({
  title = "Submit",
  icon = "send",
  pending,
  className = "",
  ...rest
}) => {
  const iconSrc = pending ? "pi pi-spin pi-spinner" : `pi pi-${icon}`;

  return (
    <Button
      type="submit"
      variant="primary"
      className={`fw-semibold text-white border-0 shadow-sm ${className}`}
      style={{
        transition: "all 0.25s ease-in-out",
        backgroundColor: "#0d6efd",
        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#0a58ca";
        e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.25)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#0d6efd";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.15)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      {...rest}
    >
      {!!icon && <i className={`${iconSrc} me-2`}></i>}
      {title}
    </Button>
  );
};
