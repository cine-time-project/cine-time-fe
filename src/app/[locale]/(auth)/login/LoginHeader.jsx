import { useTranslations } from "next-intl";
import styles from "./login.module.scss";

export default function LoginHeader() {
  const tAuth = useTranslations("auth");
  return (
    <div className={styles.loginCardHeader}>
      <p className={styles.loginCardEyebrow}>{tAuth("loginEyebrow")}</p>
      <h1 className={styles.loginCardTitle}>{tAuth("loginWelcome")}</h1>
      <p className={styles.loginCardSubtitle}>{tAuth("loginDescription")}</p>
    </div>
  );
}
