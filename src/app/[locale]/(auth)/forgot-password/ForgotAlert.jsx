"use client";
import { Alert } from "react-bootstrap";

export default function ForgotAlert({ alert, setAlert }) {
  return (
    <Alert
      variant={alert.type === "success" ? "success" : "danger"}
      onClose={() => setAlert(null)}
      dismissible
      className="forgotAlert"
    >
      {alert.message}
    </Alert>
  );
}
