import { useState } from "react";
import { signIn, signInWithGoogle, resetPassword } from "../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await signIn(email, password);
      window.location.href = "/decroche/pour-toi";
    } catch (err: any) {
      setError(err.message ?? "Connexion impossible.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 flex flex-col gap-3">
      <h1 className="text-xl font-semibold mb-2">Se connecter</h1>
      <input className="border rounded-lg px-3 py-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="border rounded-lg px-3 py-2" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="text-rose-600 text-sm">{error}</p>}
      <button className="bg-amber-400 rounded-full py-2 font-medium mt-1">Se connecter</button>
      <button type="button" onClick={() => signInWithGoogle()} className="border rounded-full py-2 font-medium">
        Continuer avec Google
      </button>
      <button
        type="button"
        className="text-sm text-slate-500 underline mt-1"
        onClick={async () => { if (email) { await resetPassword(email); setResetSent(true); } }}
      >
        Mot de passe oublié ?
      </button>
      {resetSent && <p className="text-sm text-teal-600">Email de réinitialisation envoyé.</p>}
    </form>
  );
}
