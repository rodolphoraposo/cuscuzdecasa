import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { registrarPagina } from "../lib/analytics";

/**
 * Registra uma visualização de página a cada TELA nova (muda o caminho: /, /cardapio/..., /pedido...).
 * Trocar de aba, lista/grade ou rolar até uma âncora dentro da Home não conta como página nova.
 * O setTimeout dá tempo de o título da tela atualizar e descarta redirecionamentos (ex.: /cardapio → /).
 */
export function RastreadorDePaginas() {
  const { pathname } = useLocation();
  useEffect(() => {
    const id = window.setTimeout(registrarPagina, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);
  return null;
}
