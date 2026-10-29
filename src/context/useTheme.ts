import { useCallback, useEffect, useState } from "react";

export type Tema = "light" | "dark";

export function useTheme() {
  const [tema, setTema] = useState<Tema>(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    try {
      localStorage.setItem("theme", tema);
    } catch {
      /* ignora */
    }
  }, [tema]);

  const definir = useCallback((t: Tema) => setTema(t), []);
  return { tema, definir };
}
