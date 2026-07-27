import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

export function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState(import.meta.env.VITE_ADMIN_EMAIL ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      nav("/admin/products");
    } catch {
      setError("Login incorrecto. Revisa email/password.");
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-xl font-semibold">Admin — Login</h1>

      <form onSubmit={handleLogin} className="mt-6 space-y-3">
        <input
          className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
          placeholder="Email"
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