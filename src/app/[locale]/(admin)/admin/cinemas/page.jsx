"use client";
import React from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { useParams } from "next/navigation";
import { CinemaTable } from "@/components/dashboard/cinema/CinemaTable";
import { useCinemas } from "@/components/dashboard/cinema/useCinemas";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";
import { useTranslations } from "next-intl";
import { BackButton } from "@/components/common/form-fields/BackButton";

/**
 * AdminCinemasPage
 * ----------------
 * Page-level container:
 * - Initializes permissions
 * - Delegates all data handling to `useCinemas`
 */
export default function AdminCinemasPage() {
  const { locale } = useParams();
  const tCinemas = useTranslations("cinemas");
  const { roles, token } = useAuth();

  // Backend page size (used for pagination and numbering)
  const pageSize = 20;

  const canCreate = roles?.includes("ADMIN");
  const canDelete = roles?.includes("ADMIN");

  const {
    cinemas,
    totalPages,
    currentPage,
    loading,
    error,
    setPage,
    handleDelete,
  } = useCinemas(token, pageSize);

  if (loading) return <p>{tCinemas("loading")}</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="p-3">
      <PageHeader title={tCinemas("listTitle")} leftActions={<BackButton title={tCinemas("back")}/>} />
      <Spacer />
      <CinemaTable
        data={cinemas}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        onDelete={handleDelete}
        canCreate={canCreate}
        canDelete={canDelete}
        rows={pageSize}
        locale={locale}
        translate={tCinemas}
      />
    </div>
  );
}
