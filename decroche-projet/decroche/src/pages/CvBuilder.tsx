import { useState } from "react";

interface CvData {
  prenom: string; nom: string; email: string; ville: string;
  ecole: string; competences: string; experiences: string;
  benevolat: string; langues: string; centresInteret: string;
}

const EMPTY: CvData = { prenom: "", nom: "", email: "", ville: "", ecole: "", competences: "", experiences: "", benevolat: "", langues: "", centresInteret: "" };

// Générateur de CV fonctionnel : formulaire -> aperçu live -> export PDF via
// l'impression navigateur (window.print, ciblée sur #cv-preview). Pas de
// dépendance PDF supplémentaire nécessaire ; fiable sur tous navigateurs.
export default function CvBuilder() {
  const [data, setData] = useState<CvData>(EMPTY);
  const set = (k: keyof CvData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  return (
    <div className="max-w-4xl mx-auto p-6 grid md:grid-cols-2 gap-6">
      <form className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold mb-2">Mon CV</h1>
        {([
          ["prenom", "Prénom"], ["nom", "Nom"], ["email", "Email"], ["ville", "Ville"], ["ecole", "École"],
        ] as const).map(([k, label]) => (
          <input key={k} className="border rounded-lg px-3 py-2" placeholder={label} value={data[k]} onChange={set(k)} />
        ))}
        {([
          ["competences", "Compétences (une par ligne)"],
          ["experiences", "Expériences"],
          ["benevolat", "Bénévolat / projets"],
          ["langues", "Langues"],
          ["centresInteret", "Centres d'intérêt"],
        ] as const).map(([k, label]) => (
          <textarea key={k} className="border rounded-lg px-3 py-2" placeholder={label} rows={2} value={data[k]} onChange={set(k)} />
        ))}
        <button type="button" onClick={() => window.print()} className="bg-amber-400 rounded-full py-2 font-medium mt-2">
          Télécharger en PDF
        </button>
      </form>

      <div id="cv-preview" className="border rounded-2xl p-6 bg-white">
        <h2 className="text-2xl font-bold">{data.prenom || "Prénom"} {data.nom || "Nom"}</h2>
        <p className="text-sm text-slate-500 mb-4">{data.email} · {data.ville}</p>
        {data.ecole && <Section title="Formation" text={data.ecole} />}
        {data.experiences && <Section title="Expériences" text={data.experiences} />}
        {data.competences && <Section title="Compétences" text={data.competences} />}
        {data.benevolat && <Section title="Bénévolat / projets" text={data.benevolat} />}
        {data.langues && <Section title="Langues" text={data.langues} />}
        {data.centresInteret && <Section title="Centres d'intérêt" text={data.centresInteret} />}
      </div>
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-1">{title}</h3>
      <p className="text-sm whitespace-pre-line">{text}</p>
    </div>
  );
}
