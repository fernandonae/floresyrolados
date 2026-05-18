import axios from "./axios";

export const getOrdersRequest = () => axios.get("/orders");
export const createOrderRequest = (order) => axios.post("/orders", order);
export const updateOrderRequest = (id, order) => axios.put(`/orders/${id}`, order);

// --- ESTA ES LA LÍNEA QUE TE FALTA ---
export const deleteOrderRequest = (id) => axios.delete(`/orders/${id}`);