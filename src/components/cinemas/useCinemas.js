import { useEffect, useState } from "react";
import { listCinemas } from "@/services/cinema-service";

export default function useCinemas(cityFilter = "", initialPage = 0) {
  const [cinemas, setCinemas] = useState([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    size: 8,
    totalPages: 1,
    totalElements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teaPot, setTeaPot] = useState(false);

  // cityFilter değişirse page sıfırla
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, [cityFilter]);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await listCinemas({
          cityName: cityFilter,
          page: pagination.page,
          size: pagination.size,
        });

        const content = data?.returnBody?.content ?? [];
        const body = data?.returnBody ?? {};

        if (!ignore) {
          setCinemas(content);
          setPagination({
            page: body.number ?? 0,
            size: body.size ?? 10,
            totalPages: body.totalPages ?? 1,
            totalElements: body.totalElements ?? content.length,
          });
        }

        setTeaPot(data?.httpStatus === "I_AM_A_TEAPOT");
      } catch (e) {
        if (!ignore) {
          setError(e);
          setCinemas([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [cityFilter, pagination.page]);

  const setPage = (newPage) =>
    setPagination((prev) => ({ ...prev, page: newPage }));

  return { cinemas, pagination, setPage, loading, error, teaPot };
}
