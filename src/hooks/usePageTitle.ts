import { useEffect } from "react";

/** Título único por página (leitores de tela anunciam o título ao navegar). */
export function usePageTitle(titulo: string) {
  useEffect(() => {
    const anterior = document.title;
    document.title = `${titulo} · Cuscuz de Casa`;
    return () => { document.title = anterior; };
  }, [titulo]);
}
