import { useEffect } from "react";

/**
 * Barras fixas na base (Ver pedido, Adicionar, Finalizar) podem cobrir o campo que acabou de receber o foco do
 * teclado: o navegador não considera a barra ao rolar. Aqui, depois de cada foco, a página rola o mínimo
 * necessário para o elemento ficar livre da barra.
 */
export function useFocoLivreDaBarra() {
  useEffect(() => {
    const aoFocar = (e: FocusEvent) => {
      const alvo = e.target as HTMLElement | null;
      const barra = document.querySelector<HTMLElement>(".detail-bar, .cartbar");
      if (!alvo?.getBoundingClientRect || !barra || barra.contains(alvo)) return;
      window.requestAnimationFrame(() => {
        const invade = alvo.getBoundingClientRect().bottom - (barra.getBoundingClientRect().top - 16);
        if (invade > 0) window.scrollBy({ top: invade, behavior: "instant" as ScrollBehavior });
      });
    };
    document.addEventListener("focusin", aoFocar);
    return () => document.removeEventListener("focusin", aoFocar);
  }, []);
}
