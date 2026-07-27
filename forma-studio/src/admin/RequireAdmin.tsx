import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // Cargando sesión
  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-black/60">Cargando…</p>
      </div>
    );
  }

  // No hay sesión → al login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Hay sesión → adelante ✅
  return <>{children}</>;
}