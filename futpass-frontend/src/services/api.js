import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // ajuste conforme necessário
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchStats = () => api.get("/stats");
export const fetchTickets = () => api.get("/tickets");

export default api;
