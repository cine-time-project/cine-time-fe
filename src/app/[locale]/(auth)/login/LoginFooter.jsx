import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import styles from "./login.module.scss";

export default function LoginFooter() {
  const locale = useLocale();
  const tAuth = useTranslations("auth");

  return (
    <div className={styles.loginCardFooter}>
      <span>{tAuth("noAccount")}</span>
      <Link href={`/${locale}/register`} className={styles.loginCardFooterLink}>
        {tAuth("register")}
      </Link>
    </div>
  );
}
