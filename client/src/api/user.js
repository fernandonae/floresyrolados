import axios from "./axios"; // Este usa tu configuración de la URL del backend

// Petición para traer a todos los usuarios de la base de datos
export const getUsersRequest = () => axios.get("/users");

// Petición para cambiar el estatus (Aprobar socio)
// El 'id' es el _id de MongoDB y 'status' será 'active'
export const updateUserStatusRequest = (id, status) => axios.put(`/users/${id}`, { status });

export const deleteUserRequest = (id) => axios.put(`/users/${id}`, { status: 'rejected' });