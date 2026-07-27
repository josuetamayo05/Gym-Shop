import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  if (user === undefined) {
    return <div className="p-6 text-sm text-black/60">Cargando…</div>;
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}