"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";
import { ImageEditForm } from "@/components/dashboard/images/ImageEditForm";

export default function AdminEditImagePage({ params }) {
  const { locale, id } = React.use(params);
  const searchParams = useSearchParams();
  const t = useTranslations("images.edit");
  const tCommon = useTranslations("common");
  const [image, setImage] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Try to get data from sessionStorage first
    const imageKey = searchParams.get("key");
    if (imageKey) {
      const storedData = sessionStorage.getItem(imageKey);
      if (storedData) {
        try {
          const imageData = JSON.parse(storedData);
          setImage(imageData);
          setLoading(false);
          // Clean up sessionStorage
          sessionStorage.removeItem(imageKey);
          return;
        } catch (error) {
          console.error("Failed to parse stored image data:", error);
        }
      }
    }

    // Fallback: try to get from URL params (for backwards compatibility)
    const imageDataParam = searchParams.get("data");
    if (imageDataParam) {
      try {
        const imageData = JSON.parse(decodeURIComponent(imageDataParam));
        setImage(imageData);
        setLoading(false);
        return;
      } catch (error) {
        console.error("Failed to parse image data from URL:", error);
      }
    }

    // No data found
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <>
        <PageHeader title={t("title")} />
        <Spacer />
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">{t("loading")}</span>
          </div>
        </div>
        <Spacer />
      </>
    );
  }

  // Fallback if no image data provided
  if (!image) {
    return (
      <div className="alert alert-danger">
        <h4>{t("error")}</h4>
        <p>{t("notFound")}</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={t("title")} />
      <Spacer />
      <ImageEditForm image={image} locale={locale} />
      <Spacer />
    </>
  );
}
