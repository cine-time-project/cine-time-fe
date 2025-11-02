import { useState, useEffect, useCallback } from "react";
import { listCinemas } from "@/services/cinema-service";
import { deleteCinemas } from "@/service/cinema-service";
import { swAlert, swConfirm } from "@/helpers/sweetalert";

/**
 * useCinemas
 * ----------
 * Custom hook for managing cinemas data and operations.
 *
 * Handles:
 * - Pagination
 * - Fetching data
 * - Deletion (single/batch)
 *
 * @param {string} token - Auth token for protected API calls
 * @param {number} pageSize - Number of items per page (default: 10)
 * @returns {{
 *   cinemas: Array,
 *   totalPages: number,
 *   currentPage: number,
 *   loading: boolean,
 *   error: string | null,
 *   fetchCinemas: Function,
 *   handleDelete: Function,
 *   setPage: Function
 * }}
 */
export function useCinemas(token, pageSize = 10) {
  const [cinemas, setCinemas] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch paginated cinemas list
   * @param {number} page
   */
  const fetchCinemas = useCallback(
    async (page = 0) => {
      setLoading(true);
      setError(null);
      try {
        const data = await listCinemas({ page, size: pageSize });
        setCinemas(data?.returnBody?.content || []);
        setTotalPages(data?.returnBody?.totalPages || 1);
        setCurrentPage(page);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError("Failed to load cinemas.");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  /** Delete one or multiple cinemas */
  const handleDelete = useCallback(
    async (ids) => {
      try {
        const answer = await swConfirm(`Delete Cinema(s) with ID: "${ids}"?`);
        if (!answer.isConfirmed) return;

        const idsArray = Array.isArray(ids) ? ids : [ids];
        const result = await deleteCinemas(idsArray, token);
        setCinemas((prev) => prev.filter((c) => !idsArray.includes(c.id)));
        swAlert(res.message, res.ok ? "success" : "error");
      } catch (err) {
        console.error("❌ Delete error:", err);
        alert("Error deleting cinema(s): " + err.message);
      }
    },
    [token]
  );

  /** Change page and trigger data reload */
  const setPage = (page) => fetchCinemas(page);

  // Initial load
  useEffect(() => {
    fetchCinemas(0);
  }, [fetchCinemas]);

  return {
    cinemas,
    totalPages,
    currentPage,
    loading,
    error,
    fetchCinemas,
    handleDelete,
    setPage,
  };
}
