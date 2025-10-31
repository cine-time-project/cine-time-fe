// src/helpers/axios-setup.js
import axios from "axios";

axios.defaults.baseURL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";
axios.defaults.withCredentials = true; // cookie'leri otomatik gönder
