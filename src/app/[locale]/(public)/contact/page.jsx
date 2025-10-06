// app/[locale]/(public)/contact/page.jsx
import {getTranslations} from "next-intl/server";
import SectionTitle from "@/components/common/SectionTitle";
import Spacer from "@/components/common/Spacer";
import { Contact } from "@/components/contact/Contact";
import WhatsAppFab from "@/components/contact/WhatsAppFab"; 



export async function generateMetadata() {
  const t = await getTranslations("contact");
  return {
    title: t("title"),
    description: t("subtitle"), // messages/contact.subtitle
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CineTime",
    "contactPoint": [{
      "@type": "ContactPoint",
      "telephone": "+90-212-000-0000",
      "contactType": "customer support",
      "availableLanguage": ["tr","en","de","fr"]
    }]
  };

  return (
    <>
      {/* JSON-LD burada render edilmeli */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

    
      <Spacer />
      <Contact />

      {/* İstersen sağ altta WhatsApp FAB */}
      <WhatsAppFab />
    </>
  );
}
