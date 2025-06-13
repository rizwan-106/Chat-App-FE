import axios from "axios";

export const url = "http://localhost:3105";
export const httpClient = axios.create({
  baseURL: url,
});
