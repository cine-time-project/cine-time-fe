import Link from "next/link";

export default function ForgotTabs({ locale, tAuth }) {
  return (
    <div className="forgotTabs" role="tablist" aria-label="auth-tabs">
      <Link href={`/${locale}/login`} className="forgotTab">
        {tAuth("titleLogin")}
      </Link>
      <span className="forgotTab is-active" aria-current="page">
        {tAuth("forgot.tab")}
      </span>
    </div>
  );
}
