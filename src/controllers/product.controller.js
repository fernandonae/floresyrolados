import Product from "../models/product.model.js";

// OBTENER TODOS LOS PRODUCTOS
// (Cualquier usuario logueado puede ver el catálogo)
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find(); // Quitamos el filtro de user: id para que todos vean todo
        res.json(products);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener productos" });
    }
};

// OBTENER UN SOLO PRODUCTO
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Producto no encontrado" });
        res.json(product);
    } catch (error) {
        return res.status(404).json({ message: "ID no válido" });
    }
};

export const createProduct = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Acceso denegado. Solo administradores." });
        }

        const { name, description, price, category, stock } = req.body;

        // 👇 La imagen viene de multer, no de req.body
        if (!req.file) {
            return res.status(400).json({ message: "La imagen es obligatoria" });
        }

        const newProduct = new Product({
            name,
            description,
            price,
            category,
            stock,
            image: req.file.filename, // 👈 Solo guardamos el nombre del archivo
            user: req.user.id
        });

        const savedProduct = await newProduct.save();
        res.json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ELIMINAR PRODUCTO (Solo Admin)
export const deleteProduct = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "No tienes permisos" });
        }

        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: "Producto no encontrado" });
        return res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: "Error al eliminar" });
    }
};

// ACTUALIZAR PRODUCTO (Solo Admin)
// Útil para cuando tu amigo cambie precios o se acabe el stock
export const updateProduct = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "No tienes permisos" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!updatedProduct) return res.status(404).json({ message: "Producto no encontrado" });
        res.json(updatedProduct);
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar" });
    }
};