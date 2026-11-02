import type { ReactNode } from "react";
import { empresa } from "../data/empresa";
import { usePageTitle } from "../hooks/usePageTitle";

/** Estrutura comum das páginas legais (Termos e Privacidade). */
export function Legal({ titulo, children }: { titulo: string; children: ReactNode }) {
  usePageTitle(titulo);
  return (
    <section className="section container">
      <article className="legal">
        <h1 className="t-pagina">{titulo}</h1>
        <p className="legal__data">Última atualização: {empresa.atualizadoEm}</p>
        {children}
      </article>
    </section>
  );
}
