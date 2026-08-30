import { useState } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { Heart, X, Bookmark, ArrowUp, MapPin, Wallet, Cake, RotateCcw, ShieldCheck } from "lucide-react";
import { Job } from "../../types/job";
import { CATEGORY_EMOJI } from "../../data/demoJobs";

/*
 * Le mécanisme de drag (rotateX/rotateY dérivés de la position du pointeur)
 * reprend fidèlement CardRotate de src/components/reactbits/Stack.tsx
 * (React Bits, MIT + Commons Clause). Adapté ici pour distinguer une sortie
 * à droite (like), à gauche (passe) et vers le haut (voir l'offre) au lieu
 * d'un simple "renvoyer au fond de la pile" — la logique métier de Décroche,
 * greffée sur leur physique de carte.
 */
const SENSITIVITY = 120;

function CardDrag({
  children,
  onExit,
  disabled,
}: {
  children: React.ReactNode;
  onExit: (dir: "like" | "pass" | "view") => void;
  disabled?: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [20, -20]);
  const rotateY = useTransform(x, [-100, 100], [-20, 20]);
  const likeOpacity = useTransform(x, [20, SENSITIVITY], [0, 1]);
  const passOpacity = useTransform(x, [-SENSITIVITY, -20], [1, 0]);

  function handleDragEnd(_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.x > SENSITIVITY) onExit("like");
    else if (info.offset.x < -SENSITIVITY) onExit("pass");
    else if (info.offset.y < -SENSITIVITY) onExit("view");
    else { x.set(0); y.set(0); }
  }

  if (disabled) {
    return <div className="absolute inset-0 cursor-pointer">{children}</div>;
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ scale: 1.02 }}
      onDragEnd={handleDragEnd}
    >
      {children}
      <motion.div style={{ opacity: likeOpacity }} className="absolute top-4 right-4 text-rose-500 font-bold text-xl rotate-12 pointer-events-none">J'AIME</motion.div>
      <motion.div style={{ opacity: passOpacity }} className="absolute top-4 left-4 text-slate-400 font-bold text-xl -rotate-12 pointer-events-none">PASSE</motion.div>
    </motion.div>
  );
}

function CardFace({ job, userAge }: { job: Job; userAge: number }) {
  const ageOk = userAge >= (job.minAge ?? 14);
  return (
    <div className="rounded-3xl border p-5 flex flex-col gap-3 w-full h-full bg-[var(--surface)] border-[var(--border)] shadow-xl">
      <div className="h-32 rounded-2xl flex items-center justify-center text-5xl bg-amber-400/10">
        {CATEGORY_EMOJI[job.category] ?? "💼"}
      </div>
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-500 font-semibold">✨ {job.type}</span>
        <span className="uppercase text-[var(--fg-muted)]">{job.source === "demo" ? "DONNÉE DE DÉMO" : job.source}</span>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-[var(--fg)]">{job.title}</h3>
        <p className="text-[var(--fg-muted)]">{job.company}</p>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-mono text-[var(--fg-muted)]">
        <span className="flex items-center gap-1"><MapPin size={12} />{job.city}</span>
        {job.salary && <span className="flex items-center gap-1"><Wallet size={12} />{job.salary}</span>}
        <span className="flex items-center gap-1"><Cake size={12} />{job.minAge}+</span>
      </div>
      <div className={"flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 w-fit " + (ageOk ? "bg-teal-400/10 text-teal-400" : "bg-rose-400/10 text-rose-400")}>
        <ShieldCheck size={13} /> {ageOk ? "Adapté à ton âge" : "Vérifie les conditions légales"}
      </div>
    </div>
  );
}

export default function SwipeDeck({ jobs, userAge, onLike, onSave }: { jobs: Job[]; userAge: number; onLike: (id: string) => void; onSave: (id: string) => void }) {
  const [order, setOrder] = useState(jobs.map((j) => j.id));
  const [toast, setToast] = useState<string | null>(null);

  const remaining = order.map((id) => jobs.find((j) => j.id === id)!).filter(Boolean);
  const top = remaining[0];

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 700);
  }

  function handleExit(dir: "like" | "pass" | "view") {
    if (!top) return;
    if (dir === "like") { onLike(top.id); flash("❤️ Aimé"); }
    if (dir === "view") flash("↗ Offre ouverte");
    if (dir === "pass") flash("❌ Ignoré");
    setOrder((o) => o.filter((x) => x !== top.id));
  }

  return (
    <div className="flex flex-col items-center pt-2 pb-6">
      <p className="font-mono text-xs mb-4 text-[var(--fg-muted)]">
        {remaining.length} offre{remaining.length !== 1 ? "s" : ""} restante{remaining.length !== 1 ? "s" : ""}
      </p>

      <div className="relative w-80 h-[26rem] select-none" style={{ perspective: 600 }}>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 text-sm font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-full"
          >
            {toast}
          </motion.div>
        )}

        {remaining.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-3xl border-2 border-dashed gap-3 px-6 border-[var(--border)] text-[var(--fg-muted)]">
            <span className="text-3xl">👀</span>
            <p className="font-medium">Tu as tout vu pour le moment</p>
            <button onClick={() => setOrder(jobs.map((j) => j.id))} className="mt-1 flex items-center gap-1.5 text-sm font-medium text-amber-500">
              <RotateCcw size={14} /> Recommencer la pile
            </button>
          </div>
        )}

        {remaining.slice(0, 3).reverse().map((j, i, arr) => {
          const depth = arr.length - 1 - i;
          const isTop = depth === 0;
          return (
            <motion.div
              key={j.id}
              className="absolute inset-0"
              style={{ zIndex: 10 - depth, transformOrigin: "90% 90%" }}
              animate={{ scale: 1 - depth * 0.05, y: depth * 8, rotateZ: depth * 3 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <CardDrag disabled={!isTop} onExit={handleExit}>
                <CardFace job={j} userAge={userAge} />
              </CardDrag>
            </motion.div>
          );
        })}
      </div>

      {remaining.length > 0 && (
        <div className="flex items-center gap-4 mt-6">
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleExit("pass")} className="rounded-full p-3.5 border border-[var(--border)] text-[var(--fg-muted)]"><X size={20} /></motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleExit("view")} className="rounded-full p-3.5 border border-[var(--border)] text-[var(--fg-muted)]"><ArrowUp size={20} /></motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => { onSave(top.id); flash("⭐ Sauvegardé"); }} className="rounded-full p-3.5 bg-amber-400 text-slate-900"><Bookmark size={20} /></motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleExit("like")} className="rounded-full p-4 bg-rose-500 text-white"><Heart size={22} /></motion.button>
        </div>
      )}
    </div>
  );
}
