import axios from "axios";

const instance = axios.create({
  // Fuerza el link de Render aquí para probar
  baseURL: "https://floresyrolados.onrender.com", 
  withCredentials: true,
});

export default instance;