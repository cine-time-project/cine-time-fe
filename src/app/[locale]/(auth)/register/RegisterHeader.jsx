import { useTranslations } from "next-intl";
import styles from "./register.module.scss";

export default function RegisterHeader() {
  const tAuth = useTranslations("auth");
  return (
    <div className={styles.registerCardHeader}>
      <p className={styles.registerCardEyebrow}>{tAuth("registerEyebrow")}</p>
      <h1 className={styles.registerCardTitle}>{tAuth("registerWelcome")}</h1>
      <p className={styles.registerCardSubtitle}>
        {tAuth("registerDescription")}
      </p>
    </div>
  );
}
