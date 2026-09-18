import axios from "axios";
import { supabase } from "../supabase.js";

const API = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    "http://127.0.0.1:8000",
});

API.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization =
      `Bearer ${session.access_token}`;
  }

  return config;
});

export default API;