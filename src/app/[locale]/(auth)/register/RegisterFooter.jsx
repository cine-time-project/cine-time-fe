import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import styles from "./register.module.scss";

export default function RegisterFooter() {
  const locale = useLocale();
  const tAuth = useTranslations("auth");

  return (
    <div className={styles.registerFooter}>
      <span>{tAuth("haveAccount")}</span>
      <Link href={`/${locale}/login`} className={styles.registerFooterLink}>
        {tAuth("login")}
      </Link>
    </div>
  );
}
