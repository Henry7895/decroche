import { motion } from "motion/react";
import { Home, Sparkles, Heart, User } from "lucide-react";
import { MotionHighlight, MotionHighlightItem } from "../animate-ui/effects/motion-highlight";

const ITEMS = [
  { id: "accueil", label: "Accueil", icon: Home },
  { id: "decouvrir", label: "Découvrir", icon: Sparkles },
  { id: "swipe", label: "Swipe", icon: Heart },
  { id: "profil", label: "Profil", icon: User },
];

// La pastille active est le vrai MotionHighlight d'Animate UI (le même
// mécanisme qui fait glisser le fond derrière l'onglet actif dans leur
// composant Tabs) : elle mesure la position/taille de l'item actif et anime
// un layoutId vers ces coordonnées à chaque changement.
export default function AnimatedNav({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 md:static border-t md:border-none z-20 bg-[var(--bg)] border-[var(--border)]">
      <div className="max-w-2xl mx-auto flex items-center justify-around md:justify-start md:gap-1 py-2 md:py-0">
        <MotionHighlight
          value={active}
          className="rounded-2xl bg-amber-400/10 md:bg-amber-400"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          controlledItems
        >
          {ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <MotionHighlightItem key={item.id} value={item.id} className="rounded-2xl">
                <button
                  onClick={() => onChange(item.id)}
                  className="flex flex-col md:flex-row items-center gap-0.5 md:gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 text-[color:var(--nav-fg)] w-full"
                >
                  <motion.span
                    className="flex flex-col md:flex-row items-center gap-0.5 md:gap-1.5"
                    animate={{ scale: isActive ? 1.08 : 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    style={{ color: isActive ? "var(--nav-active)" : undefined }}
                  >
                    <item.icon size={20} className="md:hidden" fill={isActive ? "currentColor" : "none"} strokeWidth={isActive ? 0 : 2} />
                    <item.icon size={15} className="hidden md:block" />
                    <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
                  </motion.span>
                </button>
              </MotionHighlightItem>
            );
          })}
        </MotionHighlight>
      </div>
    </nav>
  );
}
