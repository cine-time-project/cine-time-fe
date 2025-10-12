
import axios from "axios";
import { config } from "@/helpers/config";

export const api = axios.create({
  baseURL: config.apiURL,
  timeout: 15000,
  withCredentials: false,
  headers: { Accept: "application/json" },
});

// (İsteğe bağlı) Authorization eklemek isterseniz:
api.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});
