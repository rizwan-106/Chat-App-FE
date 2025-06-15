import axios from "axios";

export const backend_url = import.meta.env.VITE_BACKEND_URL;

export const httpClient = axios.create({
  baseURL: backend_url,
});
