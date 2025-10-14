import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: "comingSoon" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function ComingSoonLayout({ children }) {
  return children;
}
