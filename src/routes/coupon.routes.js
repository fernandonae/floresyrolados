import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { createCoupon, getCoupons, validateCoupon, deleteCoupon } from "../controllers/coupon.controller.js";

const router = Router();

router.get("/coupons", authRequired, getCoupons);
router.post("/coupons", authRequired, createCoupon);
router.post("/coupons/validate", authRequired, validateCoupon);
router.delete("/coupons/:id", authRequired, deleteCoupon);

export default router;