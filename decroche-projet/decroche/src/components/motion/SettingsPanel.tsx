import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Settings, Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Switch } from "../animate-ui/radix/switch";

// Le bouton engrenage et le panneau restent construits à la main (Motion pur),
// mais le bascule sombre/clair utilise maintenant le vrai composant Switch
// d'Animate UI (Radix + Motion, avec la morphing du curseur au clic).
export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="rounded-full p-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--fg-muted)]"
      >
        <Settings size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute right-0 top-11 w-56 rounded-2xl border p-3 z-30 origin-top-right bg-[var(--surface)] border-[var(--border)] shadow-xl"
          >
            <p className="text-xs font-medium uppercase tracking-wide mb-3 px-1 text-[var(--fg-muted)]">Thème</p>
            <div className="flex items-center justify-between px-1">
              <span className="flex items-center gap-2 text-sm font-medium text-[var(--fg)]">
                {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
                {theme === "dark" ? "Sombre" : "Clair"}
              </span>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked: boolean) => setTheme(checked ? "dark" : "light")}
                leftIcon={<Moon />}
                rightIcon={<Sun />}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
