import { getTranslations } from "next-intl/server";
import SectionTitle from "@/components/common/SectionTitle";
import Spacer from "@/components/common/Spacer";
import { Contact } from "@/components/contact/Contact";

export async function generateMetadata() {
  const t = await getTranslations("contact");
  return {
    title: t("title"),
    description: t("subtitle"), // veya ayrı meta.description anahtarı
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");
  return (
    <>
      

      <Spacer />
      <Contact />
    </>
  );
}
