import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useNavigate, Navigate } from "react-router-dom";

const AuthContext = createContext(null);
const STORAGE_KEY = "aguaya_auth_user_v1";

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Cargar del localStorage al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      }
    } catch (e) {
      console.warn("No se pudo leer el usuario del storage:", e);
    }
  }, []);

  // Persistir en localStorage ante cambios
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn("No se pudo persistir el usuario en storage:", e);
    }
  }, [user]);

  const value = useMemo(() => {
    const isAuthenticated = !!user;

    const login = (role) => {
      let newUser = {};
      if (role === "local") {
        newUser = { id: "L01", name: "Tienda Central", role: "local" };
        setUser(newUser);
        navigate("/local");
      } else if (role === "delivery") {
        newUser = { id: "D01", name: "Juan Repartidor", role: "delivery" };
        setUser(newUser);
        navigate("/delivery");
      } else {
        newUser = { id: "C01", name: "Cliente Frecuente", role: "client" };
        setUser(newUser);
        navigate("/");
      }
    };

    const logout = () => {
      setUser(null);
      navigate("/login");
    };

    const hasRole = (requiredRole) => user?.role === requiredRole;

    return {
      user,
      isAuthenticated,
      role: user?.role,
      login,
      logout,
      hasRole,
    };
  }, [user, navigate]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function ProtectedRoute({ element, requiredRole }) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    console.warn(`Acceso denegado: Rol ${requiredRole} requerido.`);
    return <Navigate to="/" replace />;
  }

  return element;
}