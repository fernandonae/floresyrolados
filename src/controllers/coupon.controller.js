import Coupon from "../models/coupon.model.js";

// Crear cupón (solo admin)
export const createCoupon = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "No autorizado" });
        const { code, discount, expiresAt, maxUses } = req.body;
        const coupon = new Coupon({ code, discount, expiresAt, maxUses });
        await coupon.save();
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Listar todos los cupones (solo admin)
export const getCoupons = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "No autorizado" });
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Validar cupón (cliente lo usa en checkout)
export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon || !coupon.isActive) 
            return res.status(404).json({ message: "Cupón inválido o inactivo" });
        if (coupon.expiresAt < new Date()) 
            return res.status(400).json({ message: "Cupón expirado" });
        if (coupon.usedCount >= coupon.maxUses) 
            return res.status(400).json({ message: "Cupón agotado" });

        res.json({ discount: coupon.discount, code: coupon.code });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar cupón (solo admin)
export const deleteCoupon = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "No autorizado" });
        await Coupon.findByIdAndDelete(req.params.id);
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};