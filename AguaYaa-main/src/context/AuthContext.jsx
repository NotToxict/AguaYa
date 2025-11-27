import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { Navigate } from "react-router-dom"; // <--- Esto faltaba para las redirecciones
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";

// --- CONFIGURACIÓN DE FIREBASE ---
// Usa las variables que definimos en el archivo .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios en la sesión de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Si el usuario se loguea en Firebase, verificamos su ROL en nuestro Backend
        try {
          const token = await firebaseUser.getIdToken();
          
          // Petición al Backend (Puerto 3001)
          const response = await fetch('http://localhost:3001/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
          
          const data = await response.json();
          
          if (data.ok) {
            // Guardamos el usuario COMPLETO (con rol y localId)
            setUser({
              ...data.user, 
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL
            });
          }
        } catch (error) {
          console.error("Error sincronizando usuario con backend:", error);
        }
      } else {
        // Si no hay usuario en Firebase, limpiamos el estado
        setUser(null);
      }
      setLoading(false); // Terminó de cargar
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // El useEffect de arriba se encargará de hacer la magia después
    } catch (error) {
      console.error("Error en login Google:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    role: user?.role,
    loginWithGoogle,
    logout,
    isLoading: loading
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}

// --- COMPONENTE PROTECTED ROUTE (El que faltaba) ---
// Este componente actúa como un guardia de seguridad para las rutas
export function ProtectedRoute({ element, requiredRole }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  // 1. Si está cargando, mostramos un mensaje de espera (o un spinner)
  if (isLoading) return <div>Cargando sesión...</div>;

  // 2. Si NO está autenticado, lo mandamos al Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si requiere un rol específico (ej: 'local') y no lo tiene, lo sacamos
  if (requiredRole && user?.role !== requiredRole) {
    console.warn(`Acceso denegado. Se requiere rol: ${requiredRole}`);
    return <Navigate to="/" replace />; // Lo mandamos al inicio
  }

  // 4. Si pasa todas las pruebas, le mostramos la página
  return element;
}