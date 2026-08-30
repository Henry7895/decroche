import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Dashboard admin minimal mais réel : lit vraiment la base (protégé par la
// policy RLS "is_admin" côté Supabase — même si quelqu'un accède à cette page
// sans être admin, les requêtes renverront 0 résultat, pas une fuite de données).
export default function Admin() {
  const [counts, setCounts] = useState<{ users: number; jobs: number; reports: number } | null>(null);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [u, j, r, rList] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("reports").select("id", { count: "exact", head: true }),
        supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(20),
      ]);
      setCounts({ users: u.count ?? 0, jobs: j.count ?? 0, reports: r.count ?? 0 });
      setReports(rList.data ?? []);
    })();
  }, []);

  async function verifyJob(jobId: string) {
    await supabase.from("jobs").update({ verified: true }).eq("id", jobId);
  }
  async function deleteJob(jobId: string) {
    await supabase.from("jobs").delete().eq("id", jobId);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Administration</h1>
      {counts && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="border rounded-xl p-4 text-center"><p className="text-2xl font-bold">{counts.users}</p><p className="text-xs text-slate-500">utilisateurs</p></div>
          <div className="border rounded-xl p-4 text-center"><p className="text-2xl font-bold">{counts.jobs}</p><p className="text-xs text-slate-500">offres</p></div>
          <div className="border rounded-xl p-4 text-center"><p className="text-2xl font-bold">{counts.reports}</p><p className="text-xs text-slate-500">signalements</p></div>
        </div>
      )}
      <h2 className="font-medium mb-2">Signalements récents</h2>
      <ul className="flex flex-col gap-2">
        {reports.map((r) => (
          <li key={r.id} className="border rounded-lg p-3 text-sm flex items-center justify-between">
            <span>Offre {r.job_id} — {r.reason}</span>
            <div className="flex gap-2">
              <button onClick={() => verifyJob(r.job_id)} className="text-teal-600 text-xs">Marquer vérifiée</button>
              <button onClick={() => deleteJob(r.job_id)} className="text-rose-600 text-xs">Supprimer l'offre</button>
            </div>
          </li>
        ))}
        {reports.length === 0 && <p className="text-sm text-slate-400">Aucun signalement.</p>}
      </ul>
    </div>
  );
}
