import { useEffect, useState } from "react";
import axios from "axios";
import { config } from "@/helpers/config.js";

const API = config.apiURL;

export default function useCinemas(cityFilter = "") {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API}/cinemas/with-showtimes-and-images`, {
          params: {
            city: cityFilter || undefined,
            page: 0,
            size: 12,
            sort: "name",
            type: "asc",
          },
          validateStatus: () => true,
        });

        if (res.status >= 400) {
          throw new Error(res.data?.message || `HTTP ${res.status}`);
        }

        const body = res.data?.returnBody ?? res.data;
        const list = Array.isArray(body) ? body : [];
        if (!ignore) setCinemas(list);
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

  return { cinemas, loading, error };
}