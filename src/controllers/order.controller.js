import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/coupon.model.js";

// 1. CREAR UNA ORDEN
export const createOrder = async (req, res) => {
    try {
        const { 
            products, 
            paymentMethod, 
            deliveryAddress, 
            customerLocation,
            phone,
            orderNote,
            scheduledTime,
            discountCode,
            discountAmount,
            outfitPhoto
        } = req.body;

        // Validación GPS
        if (!customerLocation || !customerLocation.lat || !customerLocation.lng) {
            return res.status(400).json({ message: "El GPS es obligatorio para despachar el pedido." });
        }

        // Calcular total
        let total = 0;
        for (const item of products) {
            const productData = await Product.findById(item.product);
            if (!productData) return res.status(404).json({ message: `Producto no encontrado` });
            total += productData.price * item.quantity;
        }

        // Aplicar descuento si hay cupón válido
        let finalTotal = total;
        if (discountCode && discountAmount > 0) {
            finalTotal = total - (total * discountAmount / 100);
            // Incrementar el contador de usos del cupón
            await Coupon.findOneAndUpdate(
                { code: discountCode.toUpperCase() },
                { $inc: { usedCount: 1 } }
            );
        }

        const newOrder = new Order({
            client: req.user.id,
            products,
            total: finalTotal,
            paymentMethod,
            deliveryAddress,
            customerLocation,
            paymentStatus: 'pending',
            phone,
            orderNote,
            scheduledTime,
            discountCode: discountCode || null,
            discountAmount: discountAmount || 0,
            outfitPhoto: outfitPhoto || null
        });

        const savedOrder = await newOrder.save();
        res.json(savedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. OBTENER ÓRDENES
export const getOrders = async (req, res) => {
    try {
        const { role, id } = req.user;
        
        if (role === 'admin') {
            const orders = await Order.find()
                .populate('client', 'username email')
                .populate('products.product')
                .populate('deliveryPerson', 'username')
                .sort({ createdAt: -1 });
            return res.json(orders);
        } 
        
        if (role === 'delivery') {
            const orders = await Order.find({ deliveryPerson: id })
                .populate('client', 'username email')
                .populate('products.product');
            return res.json(orders);
        } 

        const orders = await Order.find({ client: id })
            .populate('products.product')
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. ACTUALIZAR ESTADO Y UBICACIÓN DEL REPARTIDOR
export const updateOrderStatus = async (req, res) => {
    try {
        if (req.user.role === 'client') return res.status(403).json({ message: "No autorizado" });

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            req.body, 
            { new: true }
        ).populate('client', 'username').populate('products.product');

        if (!updatedOrder) return res.status(404).json({ message: "Orden no encontrada" });
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. ELIMINAR ORDEN (ADMIN)
export const deleteOrder = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Acceso denegado" });
        }
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ message: "La orden no existe" });
        return res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};