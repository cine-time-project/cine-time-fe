import { useState, useEffect } from "react";

/**
 * Custom hook to determine the number of Skeleton cards
 * to display based on current screen width (responsive).
 */
export const useResponsiveSkeletonCount = () => {
  const [count, setCount] = useState(8); // default for large screens

  const updateCount = () => {
    const width = window.innerWidth;

    if (width < 576) {
      // xs: 1 column × 2 rows
      setCount(2);
    } else if (width < 768) {
      // sm: 2 columns × 2 rows
      setCount(4);
    } else if (width < 992) {
      // md: 3 columns × 2 rows
      setCount(6);
    } else {
      // lg+: 4 columns × 2 rows
      setCount(8);
    }
  };

  useEffect(() => {
    // Initial calculation
    updateCount();

    // Update count on window resize
    window.addEventListener("resize", updateCount);

    // Clean up listener on unmount
    return () => window.removeEventListener("resize", updateCount);
  }, []);

  return count;
};
