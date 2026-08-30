import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { Heart, Bookmark } from "lucide-react";
import { ThemeProvider } from "./context/ThemeContext";
import AnimatedNav from "./components/motion/AnimatedNav";
import SettingsPanel from "./components/motion/SettingsPanel";
import SwipeDeck from "./components/motion/SwipeDeck";
import ConsentBanner from "./components/ConsentBanner";
import { DEMO_JOBS, CATEGORY_EMOJI } from "./data/demoJobs";

// Page de démonstration connectée : montre les composants Motion réels
// (nav animée, panneau de paramètres, deck de swipe) branchés ensemble.
// Les likes/sauvegardes sont ici en mémoire locale ; le branchement complet
// sur Supabase se fait via jobsService.ts (toggleLike / toggleSave) une fois
// qu'un utilisateur est connecté — voir docs/SETUP.md.
function DiscoverGrid({ likes, saves, onLike, onSave }: { likes: string[]; saves: string[]; onLike: (id: string) => void; onSave: (id: string) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 px-4">
      {DEMO_JOBS.map((job, i) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl border p-4 bg-[var(--surface)] border-[var(--border)]"
        >
          <div className="h-20 rounded-xl flex items-center justify-center text-3xl bg-amber-400/10 mb-3">
            {CATEGORY_EMOJI[job.category] ?? "💼"}
          </div>
          <h3 className="font-semibold text-[var(--fg)]">{job.title}</h3>
          <p className="text-sm text-[var(--fg-muted)] mb-3">{job.company} · {job.city}</p>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onLike(job.id)}
              className={"flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium " +
                (likes.includes(job.id) ? "bg-rose-500 text-white" : "bg-[var(--bg)] text-[var(--fg-muted)]")}
            >
              <Heart size={14} fill={likes.includes(job.id) ? "currentColor" : "none"} /> J'aime
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onSave(job.id)}
              className={"rounded-full p-2 " + (saves.includes(job.id) ? "bg-amber-400 text-slate-900" : "bg-[var(--bg)] text-[var(--fg-muted)]")}
            >
              <Bookmark size={14} fill={saves.includes(job.id) ? "currentColor" : "none"} />
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AppContent() {
  const [tab, setTab] = useState("accueil");
  const [likes, setLikes] = useState<string[]>([]);
  const [saves, setSaves] = useState<string[]>([]);

  const toggle = (arr: string[], set: (v: string[]) => void, id: string) =>
    set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between py-4 sticky top-0 z-20 backdrop-blur" style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm">D</div>
            <span className="font-semibold text-lg">Décroche</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <AnimatedNav active={tab} onChange={setTab} />
            </div>
            <SettingsPanel />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {tab === "accueil" && (
              <div className="pt-2">
                <div className="rounded-3xl p-7 mb-6 bg-gradient-to-br from-amber-400/10 to-rose-400/10 border border-[var(--border)]">
                  <p className="text-xs font-mono uppercase tracking-widest mb-2 text-amber-500">Squelette connecté</p>
                  <h1 className="text-3xl font-bold leading-tight mb-2">Ton prochain job<br />commence ici.</h1>
                  <p className="mb-5 text-[var(--fg-muted)]">Découvre des jobs adaptés à ton âge, près de chez toi.</p>
                  <div className="flex flex-wrap gap-2.5">
                    <button onClick={() => setTab("decouvrir")} className="rounded-full bg-amber-400 text-slate-900 px-5 py-2.5 text-sm font-medium">Découvrir les jobs</button>
                    <button onClick={() => setTab("swipe")} className="rounded-full px-5 py-2.5 text-sm font-medium border border-[var(--border)]">Essayer le swipe</button>
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <Link to="/connexion" className="underline text-[var(--fg-muted)]">Connexion</Link>
                  <Link to="/inscription" className="underline text-[var(--fg-muted)]">Inscription</Link>
                  <Link to="/cv" className="underline text-[var(--fg-muted)]">CV</Link>
                  <Link to="/lettre" className="underline text-[var(--fg-muted)]">Lettre</Link>
                </div>
              </div>
            )}
            {tab === "decouvrir" && <DiscoverGrid likes={likes} saves={saves} onLike={(id) => toggle(likes, setLikes, id)} onSave={(id) => toggle(saves, setSaves, id)} />}
            {tab === "swipe" && <SwipeDeck jobs={DEMO_JOBS} userAge={16} onLike={(id) => toggle(likes, setLikes, id)} onSave={(id) => toggle(saves, setSaves, id)} />}
            {tab === "profil" && (
              <div className="px-1">
                <h2 className="font-semibold text-lg mb-3">Mes jobs aimés</h2>
                {likes.length === 0 && <p className="text-sm text-[var(--fg-muted)]">Aucun like pour le moment.</p>}
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {DEMO_JOBS.filter((j) => likes.includes(j.id)).map((j) => (
                    <div key={j.id} className="rounded-2xl border p-4 bg-[var(--surface)] border-[var(--border)]">{j.title}</div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="md:hidden">
        <AnimatedNav active={tab} onChange={setTab} />
      </div>
      <ConsentBanner />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
