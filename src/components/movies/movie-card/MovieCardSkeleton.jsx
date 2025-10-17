import { Skeleton } from "primereact/skeleton";

const MovieCardSkeleton = ({ height = "400px", width = "100%" }) => {
  return (
    <div style={{ width, height, display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "20px" }}>
      {/* Poster placeholder */}
      <Skeleton shape="rectangle" width="100%" height="70%" />
      {/* Title placeholder */}
      <Skeleton width="70%" height="20px" />
      {/* Subtitle / rating */}
      <Skeleton width="50%" height="16px" />
      {/* Action buttons */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Skeleton width="45%" height="32px" borderRadius="0.5rem" />
        <Skeleton width="45%" height="32px" borderRadius="0.5rem" />
      </div>
    </div>
  );
};

export default MovieCardSkeleton;
