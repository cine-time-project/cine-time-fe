// server component
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  // ⬇️ Next 15'te params async — önce await et
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: "comingSoon" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

// (opsiyonel) burada da params'ı await edebilirsin, ama kullanmıyorsak gerekmez
export default function ComingSoonLayout({ children }) {
  return children;
}
