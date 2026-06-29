import axios from "axios";
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true,
});

api.interceptors.response.use(r => r, async (err) => {
  if (err.response?.status === 401 && !err.config.__retried) {
    err.config.__retried = true;
    try { await api.post("/auth/refresh"); return api(err.config); }
    catch { /* fallthrough */ }
  }
  return Promise.reject(err);
});
