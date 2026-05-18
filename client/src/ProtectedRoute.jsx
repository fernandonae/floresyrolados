import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Agregamos 'allowedRoles' para saber quién tiene permiso
function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h1>Cargando sesión...</h1>
      </div>
    );
  }
  
  // 1. Si no está logueado, directo al login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // 2. Si el usuario NO tiene el rol permitido, lo mandamos al inicio (Seguridad)
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // 3. Si todo está en orden, mostramos la página
  return <Outlet />;
}

export default ProtectedRoute;