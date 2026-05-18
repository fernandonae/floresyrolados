import axios from "axios";

const instance = axios.create({
  baseURL: "https://floresyrolados.onrender.com/api", 
  withCredentials: true,
});

export default instance;