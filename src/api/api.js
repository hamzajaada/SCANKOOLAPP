
import axios from "axios";
const api = axios.create({
  baseURL: "https://sysapi.scankool.com/api/v1/", // ⚠️ adapte le port si besoin
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;