"use client";
import React from "react";
import { useAuth } from "@/lib/auth/useAuth";

import { CinemaTable } from "./CinemaTable";
import { useCinemas } from "./useCinemas";

/**
 * AdminCinemasPage
 * ----------------
 * Page-level container:
 * - Initializes permissions
 * - Delegates all data handling to `useCinemas`
 */
export default function AdminCinemasPage() {
  const { roles, token } = useAuth();

  // Backend page size (used for pagination and numbering)
  const pageSize = 10;

  const canCreate = roles?.includes("ADMIN");
  const canDelete = roles?.includes("ADMIN");
  const canDetail = roles?.includes("ADMIN");

  const {
    cinemas,
    totalPages,
    currentPage,
    loading,
    error,
    setPage,
    handleDelete,
  } = useCinemas(token, pageSize);

  if (loading) return <p>Loading cinemas...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="p-3">
      <CinemaTable
        data={cinemas}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        onDelete={handleDelete}
        canCreate={canCreate}
        canDelete={canDelete}
        canDetail={canDetail}
        rows={pageSize}
      />
    </div>
  );
}
