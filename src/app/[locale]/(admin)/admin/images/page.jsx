"use client";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";
import { ImageList } from "@/components/dashboard/images/ImageList";
import { getAllImagesByPage } from "@/service/image-service";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AdminImagesPage({ params }) {
  const { locale } = React.use(params);
  const { user } = useAuth();
  const t = useTranslations("images");
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [movieFilter, setMovieFilter] = useState("");

  // Check if user is admin (can perform create/edit/delete operations)
  const isAdmin = user?.roles?.includes("ADMIN") || false;

  const fetchImages = async () => {
    try {
      const result = await getAllImagesByPage(
        page,
        12, // Show more images per page since they're displayed in a grid
        "id",
        "asc",
        query,
        movieFilter
      );
      setData(result);
    } catch (err) {
      console.error("Failed to fetch images:", err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [page, query, movieFilter]);

  return (
    <>
      <PageHeader title={t("title")} />
      <Spacer />
      <ImageList
        data={data}
        locale={locale}
        isAdmin={isAdmin}
        onPageChange={(nextPage) => setPage(nextPage)}
        onSearch={(value) => setQuery(value)}
        onFilter={(value) => setMovieFilter(value)}
        onDeleted={() => fetchImages()}
      />
      <Spacer />
    </>
  );
}
