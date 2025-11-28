import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
// 👇 IMPORTANTE: Agregamos signInWithEmailAndPassword
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword 
} from "firebase/auth";
import { initializeApp } from "firebase/app";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función auxiliar para sincronizar con TU Backend (PostgreSQL)
  const syncWithBackend = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      
      if (data.ok) {
        setUser({
          ...data.user, 
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        });
      } else {
        console.error("Error en backend:", data.error);
        setUser(null);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setUser(null);
    }
  };

  // Escuchar cambios de sesión
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await syncWithBackend(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- MÉTODO 1: GOOGLE ---
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error Google:", error);
      throw error;
    }
  };

  // --- MÉTODO 2: EMAIL Y PASSWORD (NUEVO) ---
  const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // La sincronización ocurrirá automáticamente en el useEffect
      return userCredential.user;
    } catch (error) {
      console.error("Error Email:", error);
      throw error; // Lanzamos el error para mostrarlo en el formulario
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
    loginWithEmail, // <--- Exportamos la nueva función
    logout,
    isLoading: loading
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
}

// Componente de Protección de Rutas
export function ProtectedRoute({ element, requiredRole }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <div>Cargando sesión...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return element;
}