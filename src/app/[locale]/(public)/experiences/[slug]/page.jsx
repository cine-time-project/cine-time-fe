import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ExperienceView from "@/components/experience/ExperienceView";
import { EXPERIENCES } from "@/config/experiences.config"; // <-- burası değişti
import "@/styles/experience.scss"; // global stile aldık

export default async function ExperiencePage({ params }) {
  const { locale, slug } = await params;
  const content = EXPERIENCES[slug];
  if (!content) return notFound();

  const t = await getTranslations({ locale, namespace: "experiences" });

  // Kartlarda görsel olsun
  const showImages = true;

  return (
    <ExperienceView
      t={t}
      locale={locale}
      content={content}
      showImages={showImages}
    />
  );
}

export async function generateStaticParams() {
  return Object.keys(EXPERIENCES).map((slug) => ({ slug }));
}
