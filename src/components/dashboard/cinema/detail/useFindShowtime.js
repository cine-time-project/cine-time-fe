"use client";

import { useCallback, useState } from "react";

export function useFindShowtime(initialDate  = null, initialMovieId = null) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedMovieID, setSelectedMovieID] = useState(initialMovieId);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const selectMovie = useCallback((movieId) => {
    setSelectedMovieID(prev => (prev === movieId ? null : movieId)); // toggle
  }, []);

  return {
    selectedDate,
    setSelectedDate: handleDateChange,
    selectedMovieID, selectMovie
  };
}
