import { createContext, useState, useContext, useEffect } from "react";
import { registerRequest, loginRequest, verifyTokenRequest } from "../api/auth";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe estar dentro de un AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Limpiar errores automáticamente después de 5 segundos
  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  // --- REGISTRO ---
  const signup = async (userFormData) => {
    try {
      const res = await registerRequest(userFormData);
      
      // Si el usuario se registra con éxito, guardamos sus datos
      // Nota: Si quieres que tenga que iniciar sesión manualmente para evitar
      // que el navegador guarde datos antes de tiempo, comenta las siguientes 2 líneas:
      setUser(res.data);
      setIsAuthenticated(true); 
      
      return res.data;
    } catch (error) {
      const errorData = error.response?.data;
      setErrors(Array.isArray(errorData) ? errorData : [errorData?.message || "Error en el registro"]);
    }
  };

  // --- INICIO DE SESIÓN ---
  const signin = async (user) => {
    try {
      const res = await loginRequest(user);
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]); // Limpiamos errores previos al entrar con éxito
    } catch (error) {
      const errorData = error.response?.data;
      setErrors(Array.isArray(errorData) ? errorData : [errorData?.message || "Error al iniciar sesión"]);
    }
  };

  // --- CERRAR SESIÓN (Modificado para limpieza total) ---
  const logout = () => {
    Cookies.remove("token"); // Eliminamos la cookie
    setUser(null);           // Limpiamos los datos del usuario
    setIsAuthenticated(false); // Cambiamos el estado de autenticación
    setErrors([]);           // Limpiamos cualquier error pendiente
    localStorage.removeItem("cannaland_cart"); // 👈 agrega esto
  };

  // --- VERIFICACIÓN DE TOKEN AL CARGAR ---
  useEffect(() => {
    async function checkLogin() {
      const cookies = Cookies.get();
      
      if (!cookies.token) {
        setIsAuthenticated(false);
        setLoading(false);
        return setUser(null);
      }

      try {
        const res = await verifyTokenRequest(cookies.token);
        if (!res.data) {
          setIsAuthenticated(false);
          setUser(null);
        } else {
          setIsAuthenticated(true);
          setUser(res.data);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{ 
        signup, 
        signin, 
        logout, 
        user, 
        isAuthenticated, 
        errors, 
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};