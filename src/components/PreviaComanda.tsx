import type { ReactNode } from "react";

/** Mostra a comanda como ela chega no WhatsApp: *texto* em negrito, sem HTML injetado. */
export function PreviaComanda({ texto, rotuloId }: { texto: string; rotuloId: string }) {
  return (
    <div className="previa" role="group" aria-labelledby={rotuloId}>
      {texto.split("\n").map((linha, i) => (
        <p className="previa__linha" key={i}>{linha === "" ? "\u00a0" : negritos(linha)}</p>
      ))}
    </div>
  );
}

function negritos(linha: string): ReactNode[] {
  return linha.split(/(\*[^*]+\*)/).map((trecho, i) =>
    /^\*[^*]+\*$/.test(trecho) ? <strong key={i}>{trecho.slice(1, -1)}</strong> : trecho,
  );
}
