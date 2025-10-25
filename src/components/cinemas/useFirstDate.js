import { useEffect, useState } from "react";
import axios from "axios";
import { authHeaders } from "@/lib/utils/http";
import { config } from "@/helpers/config.js";
import { firstUpcomingDate } from "./utils";

const API = config.apiURL;

export default function useFirstDates(cinemas = []) {
  const [map, setMap] = useState({});

  useEffect(() => {
    let ignore = false;
    if (!cinemas || cinemas.length === 0) {
      setMap({});
      return;
    }

    (async () => {
      try {
        const entries = await Promise.all(
          cinemas.map(async (c) => {
            try {
              const r = await axios.get(`${API}/show-times/cinema/${c.id}`, {
                headers: authHeaders(),
                validateStatus: () => true,
              });
              if (r.status >= 400) throw new Error(`HTTP ${r.status}`);
              const body = r.data?.returnBody ?? r.data;
              const halls = Array.isArray(body) ? body : [];
              const fd = firstUpcomingDate(halls);
              return [c.id, fd];
            } catch {
              return [c.id, null];
            }
          })
        );
        if (!ignore) setMap(Object.fromEntries(entries));
      } catch {
        if (!ignore) setMap({});
      }
    })();

    return () => {
      ignore = true;
    };
  }, [cinemas]);

  return map;
}