import Link from "next/link";

export default function ForgotFooter({ tAuth, locale }) {
  return (
    <div className="forgotFooter">
      <Link href={`/${locale}/login`} className="forgotFooterLink">
        ← {tAuth("backToLogin")}
      </Link>
      <span>·</span>
      <Link href={`/${locale}/register`} className="forgotFooterLink">
        {tAuth("register")}
      </Link>
    </div>
  );
}
