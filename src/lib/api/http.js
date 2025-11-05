import axios from "axios";
import { config } from "@/helpers/config"; //  config.js

const http = axios.create({
  baseURL: config.apiURL,     // ← TEK KAYNAK
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});


// Auth header (SSR)
http.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    try {
      const t = localStorage.getItem("token");
      if (t) cfg.headers.Authorization = `Bearer ${t}`;
    } catch (_) {}
  }
  return cfg;
});

// Opsiyonel: response unwrapping helper
export const unwrap = (r) => r?.data?.returnBody ?? r?.data ?? null;

export default http;
