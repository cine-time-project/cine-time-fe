import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import styles from "./register.module.scss";

export default function RegisterTabs() {
  const locale = useLocale();
  const tAuth = useTranslations("auth");
  return (
    <div className={styles.registerCardTabs} role="tablist">
      <Link href={`/${locale}/login`} className={styles.registerCardTab}>
        {tAuth("titleLogin")}
      </Link>
      <span className={`${styles.registerCardTab} is-active`}>
        {tAuth("register")}
      </span>
    </div>
  );
}
