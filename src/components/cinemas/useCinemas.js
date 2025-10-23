import { useEffect, useState } from "react";
import { listCinemas } from "@/services/cinema-service";

export default function useCinemas(cityFilter = "") {
  const [cinemas, setCinemas] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await listCinemas({ cityName: cityFilter });

        // ✅ sinema listesi burada
        const content = data?.returnBody?.content ?? [];
        const pageInfo = data?.returnBody;

        if (!ignore) {
          setCinemas(content);
          setPagination(pageInfo);
        }
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
  }, [cityFilter]);

  return { cinemas, pagination, loading, error };
}
