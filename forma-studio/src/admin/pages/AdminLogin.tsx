import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

export function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("j70648423@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      nav("/admin/products");
    } catch (err) {
      const error = err as FirebaseError;
      console.error("Firebase login error:", error.code, error.message);

      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
        case "auth/invalid-login-credentials":
          setError("Email o contraseña incorrectos.");
          break;

        case "auth/invalid-email":
          setError("El formato del email no es válido.");
          break;

        case "auth/too-many-requests":
          setError("Demasiados intentos. Espera unos minutos e inténtalo otra vez.");
          break;

        case "auth/network-request-failed":
          setError("Error de red. Revisa tu conexión o la configuración.");
          break;

        case "auth/user-disabled":
          setError("Esta cuenta ha sido deshabilitada.");
          break;

        case "auth/operation-not-allowed":
          setError("El login con email/password no está habilitado en Firebase.");
          break;

        default:
          setError(`Error: ${error.code}`);
      }
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-xl font-semibold">Admin — Login</h1>

      <form onSubmit={handleLogin} className="mt-6 space-y-3">
        <input
          className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <button className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white">
          Entrar
        </button>
      </form>
    </main>
  );
}