"use client";

import { Button } from "react-bootstrap";

/**
 * Dil destekli submit butonu.
 * title/pendingTitle geriye dönük; label/pendingLabel tercih edin.
 */
export const SubmitButton = ({
  pending = false,
  label = "Submit",
  pendingLabel = "Sending...",
  title,            // eski kullanım için
  pendingTitle,     // eski kullanım için
  icon = "send",
  className = "",
  ...rest
}) => {
  const text = pending ? (pendingTitle ?? pendingLabel) : (title ?? label);
  const iconClass = pending
    ? "pi pi-spin pi-spinner"
    : icon
    ? `pi pi-${icon}`
    : "";

  return (
    <Button
      type="submit"
      variant="outline-primary"
      disabled={pending}
      aria-busy={pending}
      className={className}
      {...rest}
    >
      {icon && <i className={iconClass} />}
      {icon && " "}
      {text}
    </Button>
  );
};

export default SubmitButton;
