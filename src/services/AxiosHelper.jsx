import axios from "axios";

export const backend_url = "http://localhost:3105";
export const httpClient = axios.create({
  baseURL: backend_url,
});
