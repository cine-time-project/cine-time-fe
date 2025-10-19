import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import styles from "./login.module.scss";

export default function LoginTabs() {
  const locale = useLocale();
  const tAuth = useTranslations("auth");

  return (
    <div className={styles.loginCardTabs} role="tablist">
      <span className={`${styles.loginCardTab} is-active`}>
        {tAuth("titleLogin")}
      </span>
      <Link href={`/${locale}/register`} className={styles.loginCardTab}>
        {tAuth("register")}
      </Link>
    </div>
  );
}
