import axios from "axios";

// Si existe la variable en Vercel, la usa. Si no, usa localhost para cuando tú programes.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const instance = axios.create({
  baseURL: API_URL, 
  withCredentials: true,
});

export default instance;