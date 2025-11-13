import Image from "next/image";
import "./campaigns.scss";
import { getTranslations } from "next-intl/server";
import ZoomableCampaignsGrid from "./ZoomableCampaignsGrid";
import CampaignsCollapse from "./CampaignsCollapse";

export default async function CampaignsPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "campaigns" });

  const gridItems = [
    {
      src: "/images/campaigns/discount_ticket.jpg",
      alt: t("discount.alt"),
      title: t("discount.title"),
      body: t("discount.desc"),
      date: t("discount.date"),
    },
    {
      src: "/images/campaigns/early_bird.jpg",
      alt: t("earlybird.alt"),
      title: t("earlybird.title"),
      body: t("earlybird.desc"),
      date: t("earlybird.date"),
    },
    {
      src: "/images/campaigns/festival_offer.jpg",
      alt: t("festival.alt"),
      title: t("festival.title"),
      body: t("festival.desc"),
      date: t("festival.date"),
    },
    {
      src: "/images/campaigns/free_popcorn.jpg",
      alt: t("freepopcorn.alt"),
      title: t("freepopcorn.title"),
      body: t("freepopcorn.desc"),
      date: t("freepopcorn.date"),
    },
    {
      src: "/images/campaigns/member_benefits.jpg",
      alt: t("member.alt"),
      title: t("member.title"),
      body: t("member.desc"),
      date: t("member.date"),
    },
    {
      src: "/images/campaigns/night_show.jpg",
      alt: t("nightshow.alt"),
      title: t("nightshow.title"),
      body: t("nightshow.desc"),
      date: t("nightshow.date"),
    },
  ];

  return (
    <section className="campaigns container">
      <header className="campaigns__hero">
        <div className="hero__copy">
          <h1 className="hero__title">{t("heroTitle")}</h1>
          <p className="hero__subtitle">{t("heroSubtitle")}</p>
        </div>

        <div className="hero__media">
          <Image
            src="/images/campaigns/hero_campaign.jpg"
            alt={t("heroAlt")}
            fill
            priority
            className="hero__img"
            sizes="(max-width: 1024px) 100vw, 48vw"
          />
        </div>
      </header>

      <ZoomableCampaignsGrid items={gridItems} />

      {/* CTA: Artık collapse */}
      <CampaignsCollapse
        title={t("ctaTitle")}
        body={t("ctaBody")}
        btnOpen={t("ctaButtonOpen")}
        btnClose={t("ctaButtonClose")}
      />
    </section>
  );
}
