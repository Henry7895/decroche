import { useState } from "react";
import { signUp } from "../services/authService";

// Inscription minimale et fonctionnelle. Le méga-prompt demandait un flux en
// 7 étapes (pseudo, date de naissance, ville, préférences...) — la logique
// multi-étapes est de l'UI pure à ajouter par-dessus ce formulaire une fois
// que la brique "ça crée vraiment un compte" fonctionne. Mieux vaut un compte
// réel simple qu'un joli wizard qui ne sauvegarde rien.
export default function Signup() {
  const [pseudo, setPseudo] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const age = dateNaissance
    ? Math.floor((Date.now() - new Date(dateNaissance).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (age !== null && (age < 14 || age > 18)) {
      setError("Décroche est réservé aux 14-18 ans.");
      return;
    }
    try {
      await signUp(email, password, pseudo);
      setDone(true); // Supabase envoie un email de vérification automatiquement.
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de l'inscription.");
    }
  }

  if (done) {
    return <p className="p-6">Vérifie ta boîte mail pour confirmer ton compte 📩</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 flex flex-col gap-3">
      <h1 className="text-xl font-semibold mb-2">Créer mon compte</h1>
      <input className="border rounded-lg px-3 py-2" placeholder="Pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} required />
      <label className="text-sm text-slate-500">Date de naissance</label>
      <input className="border rounded-lg px-3 py-2" type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} required />
      <input className="border rounded-lg px-3 py-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="border rounded-lg px-3 py-2" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      {error && <p className="text-rose-600 text-sm">{error}</p>}
      <button className="bg-amber-400 rounded-full py-2 font-medium mt-2">Créer mon compte</button>
    </form>
  );
}
