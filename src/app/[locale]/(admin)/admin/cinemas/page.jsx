"use client";
import React, { useState, useEffect } from "react";
import { CinemaTable } from "./CinemaTable";
import { listCinemas } from "@/services/cinema-service";
import { deleteCinemas } from "@/service/cinema-service";
import { useAuth } from "@/lib/auth/useAuth";


/**
 * AdminCinemasPage component
 * - Displays paginated list of cinemas
 * - Provides handleDelete function to child component for deleting cinemas
 * - Supports single & batch deletion (batch selection state managed here)
 *
 * @param {object} params - Next.js route params (e.g., locale)
 */
export default function AdminCinemasPage({ params }) {
  const { user, roles, token, loading } = useAuth();
  const { locale } = React.use(params);

  console.log(user, roles, token);

  // State: list of cinemas displayed on current page
  const [cinemas, setCinemas] = useState([]);
  // State: current page index (0-indexed)
  const [currentPage, setCurrentPage] = useState(0);
  // State: total pages from backend
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 8;

  // State: IDs of selected cinemas for batch deletion
  const [selectedIds, setSelectedIds] = useState([]);

  /**
   * Fetch paginated cinemas from backend
   * @param {number} page - page number (0-indexed)
   */
  const fetchCinemas = async (page = 0) => {
    try {
      const data = await listCinemas({ page, size: pageSize });
      const cinemasFromBE = data?.returnBody?.content || [];
      const totalPagesFromBE = data?.returnBody?.totalPages || 1;

      setCinemas(cinemasFromBE);
      setTotalPages(totalPagesFromBE);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch cinemas:", err);
    }
  };

  // Fetch cinemas whenever currentPage changes
  useEffect(() => {
    fetchCinemas(currentPage);
  }, [currentPage]);

  /**
   * Handle page change (pagination)
   * @param {number} newPage
   */
  const handlePageChange = (newPage) => {
    fetchCinemas(newPage);
  };

  /**
   * Toggle selection of a cinema for batch deletion
   * @param {number} id - Cinema ID
   */
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  /**
   * Delete one or multiple cinemas
   * This function will be passed to CinemaTable and triggered by Delete buttons there
   * @param {number|number[]} ids
   */
  const handleDelete = async (ids) => {
    try {
      const result = await deleteCinemas(ids, token);
      alert(result.message);

      const idsToRemove = Array.isArray(ids) ? ids : [ids];
      // Update local state after deletion
      setCinemas((prev) => prev.filter((c) => !idsToRemove.includes(c.id)));
      setSelectedIds((prev) => prev.filter((id) => !idsToRemove.includes(id)));
    } catch (err) {
      console.error(err);
      alert("Error deleting cinema(s): " + err.message);
    }
  };

  return (
    <div>
      {/* CinemaTable receives all necessary props including handleDelete */}
      <CinemaTable
        data={cinemas}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange} // pagination
        selectedIds={selectedIds} // for checkboxes
        onToggleSelect={toggleSelect} // checkbox selection
        onDelete={handleDelete} // Delete button in child will call this
      />
    </div>
  );
}
