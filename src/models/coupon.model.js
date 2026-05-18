import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true,
        uppercase: true,
        trim: true
    },
    discount: { 
        type: Number, 
        required: true,
        min: 1,
        max: 100
    },
    expiresAt: { 
        type: Date, 
        required: true 
    },
    maxUses: { 
        type: Number, 
        default: 100 
    },
    usedCount: { 
        type: Number, 
        default: 0 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

export default mongoose.model("Coupon", couponSchema);