"use client";

import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";

export const BackButton = ({
  title = "Back",
  icon = "arrow-circle-left",
  className = "",
  ...rest
}) => {
  const router = useRouter();

  const handleClick = () => router.back();

  return (
    <Button
      type="button"
      variant="secondary"
      className={`fw-semibold text-white border-0 shadow-sm ${className}`}
      style={{
        transition: "all 0.25s ease-in-out",
        backgroundColor: "#6c757d",
        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#5c636a";
        e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.25)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#6c757d";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.15)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      onClick={handleClick}
      {...rest}
    >
      {icon && <i className={`pi pi-${icon} me-2`}></i>}
      {title}
    </Button>
  );
};
