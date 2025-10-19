import { Alert } from "react-bootstrap";
import styles from "./register.module.scss";

export default function RegisterAlert({ alert, setAlert }) {
  if (!alert) return null;
  return (
    <Alert
      variant={alert.type === "success" ? "success" : "danger"}
      dismissible
      onClose={() => setAlert(null)}
      className={styles.registerCardAlert}
    >
      {alert.message}
    </Alert>
  );
}
