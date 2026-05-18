import axios from "./axios";

export const getCouponsRequest = () => axios.get("/coupons");
export const createCouponRequest = (data) => axios.post("/coupons", data);
export const validateCouponRequest = (code) => axios.post("/coupons/validate", { code });
export const deleteCouponRequest = (id) => axios.delete(`/coupons/${id}`);