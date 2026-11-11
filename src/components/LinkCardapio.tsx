import type { ComponentProps, MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";

/** Endereço do cardápio: seção #cardapio da Home. */
export const IR_AO_CARDAPIO = "/#cardapio";

/**
 * Todo botão "Peça agora" / "Cardápio" usa este link.
 * Fora da Home, navega para /#cardapio. Na Home, rola até a seção e leva o foco ao título
 * (o clique repetido também funciona, mesmo com a âncora já na barra de endereço).
 */
export function LinkCardapio({ onClick, ...resto }: Omit<ComponentProps<typeof Link>, "to">) {
  const { pathname } = useLocation();

  const aoClicar = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || pathname !== "/") return;
    const secao = document.getElementById("cardapio");
    if (!secao || typeof secao.scrollIntoView !== "function") return;
    e.preventDefault();
    const reduzir = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    secao.scrollIntoView({ behavior: reduzir ? "auto" : "smooth" });
    document.getElementById("cardapio-titulo")?.focus({ preventScroll: true });
  };

  return <Link to={IR_AO_CARDAPIO} onClick={aoClicar} {...resto} />;
}
