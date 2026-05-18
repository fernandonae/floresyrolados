import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: { 
            type: Number, 
            required: true,
            min: [1, "La cantidad mínima es 1"]
        }
    }],
    total: { type: Number, required: true },
    paymentMethod: {
        type: String,
        enum: ['cash', 'transfer'], 
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'rejected'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['received', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'received'
    },
    deliveryPerson: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    deliveryAddress: { type: String, required: true, trim: true },
    customerLocation: {
        lat: { type: Number, required: [true, "Latitud requerida"], min: -90, max: 90 },
        lng: { type: Number, required: [true, "Longitud requerida"], min: -180, max: 180 }
    },
    deliveryPersonLocation: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    },
    paymentReceipt: { type: String, default: null },

    // --- CAMPOS NUEVOS ---
    outfitPhoto: { type: String, default: null },
    scheduledTime: { type: Date, required: true },
    discountCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    orderNote: { type: String, default: null },

}, { timestamps: true });

orderSchema.index({ "customerLocation.lat": 1, "customerLocation.lng": 1 });

export default mongoose.model("Order", orderSchema);