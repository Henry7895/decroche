import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "dark",
  setTheme: () => {},
});

// Sombre par défaut, choix mémorisé (le thème clair reste accessible dans les
// paramètres — pas un simple bouton dans la barre du haut).
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("decroche_theme") as Theme) || "dark");

  useEffect(() => {
    localStorage.setItem("decroche_theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
