// hooks/useCinemaDetails.js
"use client";

import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { getDetailedCinema } from "@/service/cinema-service";

/**
 * Custom hook to manage cinema details, including fetching, sorting, 
 * edit mode, authentication, and error handling.
 *
 * @param {number|string} cinemaId - The ID of the cinema to fetch
 * @returns {Object} - cinema state, loading state, edit permissions, and utility functions
 */
export function useCinemaDetails(cinemaId) {
  // -----------------------------
  // Local state
  // -----------------------------
  const [cinema, setCinema] = useState(null);       // Stores the fetched cinema data
  const [loading, setLoading] = useState(true);     // Loading state for async calls
  const [token, setToken] = useState("");           // Authentication token from localStorage
  const [canEdit, setCanEdit] = useState(false);    // Determines if user has edit permissions
  const [isEditMode, setEditMode] = useState(false);// Toggles edit vs read-only UI

  const editRoles = ["ADMIN"]; // Roles allowed to edit cinema

  // -----------------------------
  // Toggle edit mode
  // -----------------------------
  const toggleEditMode = () => setEditMode((prev) => !prev);

  // -----------------------------
  // Load authentication token and user roles from localStorage
  // -----------------------------
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const userRaw = localStorage.getItem("authUser");
    const user = userRaw ? JSON.parse(userRaw) : null;

    setToken(storedToken || "");
    setCanEdit(user?.roles?.some((r) => editRoles.includes(r)) || false);
  }, []);

  // -----------------------------
  // Fetch cinema data and sort halls & showtimes
  // -----------------------------
  const fetchCinema = useCallback(async () => {
    if (!token || !cinemaId) return;

    setLoading(true);
    try {
      const data = await getDetailedCinema(cinemaId, token);

      // -----------------------------
      // Sort halls alphabetically by name
      // and sort showtimes by startTime
      // -----------------------------
      const sortedCinema = {
        ...data,
        halls: data.halls
          ?.slice() // create a shallow copy to avoid mutating original data
          .sort((a, b) => a.name.localeCompare(b.name)) // Hall name sorting
          .map((hall) => ({
            ...hall,
            showtimes: hall.showtimes
              ?.slice()
              .sort((a, b) => a.startTime.localeCompare(b.startTime)), // startTime sorting
          })),
      };

      setCinema(sortedCinema);
    } catch (err) {
      // -----------------------------
      // Handle errors gracefully using SweetAlert2
      // -----------------------------
      Swal.fire(
        "Error",
        err.response?.data?.message || err.message || "Something went wrong",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [cinemaId, token]);

  // -----------------------------
  // Trigger initial fetch when token is available or cinemaId changes
  // -----------------------------
  useEffect(() => {
    fetchCinema();
  }, [fetchCinema]);

  // -----------------------------
  // Return state and utility functions
  // -----------------------------
  return {
    cinema,           // Sorted cinema object
    loading,          // Loading state
    canEdit,          // Boolean flag for edit permission
    isEditMode,       // Current edit mode state
    toggleEditMode,   // Function to toggle edit mode
    refreshCinema: fetchCinema, // Function to refetch & refresh cinema data
  };
}
