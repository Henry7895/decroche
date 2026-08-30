import { useState } from "react";

// Générateur de lettre de motivation : remplit un modèle avec les infos
// saisies, le résultat est un texte modifiable (pas figé) que le jeune
// peut copier ou ajuster avant envoi.
export default function CoverLetterBuilder() {
  const [prenom, setPrenom] = useState("");
  const [poste, setPoste] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [qualites, setQualites] = useState("");
  const [letter, setLetter] = useState("");

  function generate() {
    setLetter(
`Madame, Monsieur,

Je me permets de vous contacter au sujet du poste de ${poste || "[poste]"} au sein de ${entreprise || "[entreprise]"}.

${qualites ? `Je pense pouvoir apporter à votre équipe : ${qualites}.` : "Motivé·e et sérieux·se, je souhaite m'investir pleinement dans cette mission."} Bien que ce soit l'une de mes premières expériences professionnelles, je suis disponible, ponctuel·le et prêt·e à apprendre rapidement.

Je reste à votre disposition pour un entretien à votre convenance.

Cordialement,
${prenom || "[Prénom]"}`
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-3">
      <h1 className="text-xl font-semibold mb-2">Ma lettre de motivation</h1>
      <input className="border rounded-lg px-3 py-2" placeholder="Ton prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
      <input className="border rounded-lg px-3 py-2" placeholder="Poste visé" value={poste} onChange={(e) => setPoste(e.target.value)} />
      <input className="border rounded-lg px-3 py-2" placeholder="Entreprise" value={entreprise} onChange={(e) => setEntreprise(e.target.value)} />
      <input className="border rounded-lg px-3 py-2" placeholder="Tes qualités (ex : ponctuel, souriant, motivé)" value={qualites} onChange={(e) => setQualites(e.target.value)} />
      <button onClick={generate} className="bg-amber-400 rounded-full py-2 font-medium">Générer</button>
      {letter && (
        <>
          <textarea className="border rounded-lg px-3 py-3 mt-2" rows={12} value={letter} onChange={(e) => setLetter(e.target.value)} />
          <button onClick={() => navigator.clipboard.writeText(letter)} className="border rounded-full py-2 font-medium">Copier</button>
        </>
      )}
    </div>
  );
}
