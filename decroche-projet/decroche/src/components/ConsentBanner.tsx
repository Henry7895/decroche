import { useState } from "react";

// Bandeau de consentement affiché à la première visite.
// Conforme RGPD "consentement adapté à l'âge" : langage simple, pas de case
// pré-cochée, refus aussi facile que l'acceptation, lien vers la politique complète.
export default function ConsentBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem("decroche_consent") !== null
  );

  function respond(accepted: boolean) {
    localStorage.setItem("decroche_consent", accepted ? "accepted" : "declined");
    setDismissed(true);
    // Si tu ajoutes des cookies/analytics non essentiels, ne les charger
    // qu'après un "accepted" ici — jamais avant.
  }

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-slate-900 text-slate-100 p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
      <p className="text-sm max-w-2xl">
        On utilise le strict nécessaire pour faire fonctionner ton compte (connexion, tes likes,
        tes sauvegardes). Pas de revente de données, pas de pub ciblée.{" "}
        <a href="/decroche/confidentialite" className="underline">
          Voir la politique de confidentialité
        </a>
        .
      </p>
      <div className="flex gap-2 shrink-0">
        <button onClick={() => respond(false)} className="px-4 py-2 rounded-full border border-slate-600 text-sm">
          Refuser le non-essentiel
        </button>
        <button onClick={() => respond(true)} className="px-4 py-2 rounded-full bg-amber-400 text-slate-900 text-sm font-medium">
          J'accepte
        </button>
      </div>
    </div>
  );
}
