import { createContext, useContext, useState } from "react";
import axios from "../api/axios"; 

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts debe usarse dentro de ProductProvider");
  return context;
};

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);

  const getProducts = async () => {
    try {
      const res = await axios.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const createProduct = async (productData) => {
    try {
      const res = await axios.post("/products", productData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts((prevProducts) => [res.data, ...prevProducts]);
      return true;
    } catch (error) {
      console.error("❌ ERROR DEL SERVIDOR:", error.response?.data || error.message);
      return false;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      return true;
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      return false;
    }
  };

  return (
    <ProductContext.Provider value={{ products, getProducts, createProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
}