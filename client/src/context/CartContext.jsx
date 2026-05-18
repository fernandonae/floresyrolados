import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de un CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  // 1. ESTADOS DEL CARRITO
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cannaland_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 2. ESTADOS DE UBICACIÓN (Nuevos para el Mapa y Seguridad)
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);

  // Guardar carrito en LocalStorage
  useEffect(() => {
    localStorage.setItem("cannaland_cart", JSON.stringify(cart));
  }, [cart]);

  // --- FUNCIÓN DE GEOLOCALIZACIÓN ---
  const getPreciseLocation = () => {
    if (!navigator.geolocation) {
      alert("⚠️ Tu navegador no soporta GPS.");
      return;
    }

    // Pedimos permiso al navegador
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(false);
      },
      (error) => {
        console.error("Error GPS:", error);
        setLocationError(true); // El usuario le dio a "BLOQUEAR/NO PERMITIR"
      },
      { enableHighAccuracy: true }
    );
  };

  // --- LÓGICA DEL CARRITO ---

  const addToCart = (product) => {
    setCart((prevCart) => {
      const itemExists = prevCart.find((item) => item._id === product._id);
      if (itemExists) {
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const decreaseQuantity = (id) => {
    setCart((prevCart) => {
      const itemExists = prevCart.find((item) => item._id === id);
      if (!itemExists) return prevCart;
      if (itemExists.quantity === 1) {
        return prevCart.filter((item) => item._id !== id);
      }
      return prevCart.map((item) =>
        item._id === id ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== id));
  };

  const clearCart = () => setCart([]);

  // Cálculos
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      decreaseQuantity, 
      removeFromCart, 
      clearCart, 
      cartTotal, 
      cartCount,
      // Exportamos lo del GPS
      location,
      locationError,
      getPreciseLocation
    }}>
      {children}
    </CartContext.Provider>
  );
};