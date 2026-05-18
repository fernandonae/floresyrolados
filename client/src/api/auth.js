import axios from "./axios";

// Registro: IMPORTANTE
// Al pasar 'user' (que ahora es un FormData), Axios detecta automáticamente 
// que lleva archivos y configura el "Content-Type" correcto.
export const registerRequest = (user) => axios.post(`/register`, user, {
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

// Login: Sigue siendo JSON normal
export const loginRequest = (user) => axios.post(`/login`, user);

// Verificar Token
export const verifyTokenRequest = () => axios.get(`/verify`);