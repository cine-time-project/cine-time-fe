import axios from 'axios';
const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api',
  withCredentials: true
});
http.interceptors.request.use(cfg => {
  const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
export default http;
