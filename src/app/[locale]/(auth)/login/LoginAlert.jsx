import { Alert } from "react-bootstrap";
import styles from "./login.module.scss";

export default function LoginAlert({ alert, setAlert }) {
  if (!alert) return null;
  return (
    <Alert
      variant={alert.type === "success" ? "success" : "danger"}
      dismissible
      onClose={() => setAlert(null)}
      className={styles.loginCardAlert}
    >
      {alert.message}
    </Alert>
  );
}
