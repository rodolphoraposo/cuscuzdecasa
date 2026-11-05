import type { ReactNode } from "react";

/**
 * Mostra a comanda como ela chega no WhatsApp: *texto* em negrito e o que fica entre ``` em fonte monoespaçada.
 * Tudo vira elementos do React (nada de HTML injetado).
 */
export function PreviaComanda({ texto, rotuloId }: { texto: string; rotuloId: string }) {
  const partes = texto.split("```"); // posições ímpares = bloco monoespaçado
  return (
    <div className="previa" role="group" aria-labelledby={rotuloId}>
      {partes.map((parte, i) => {
        if (i % 2 === 1) {
          return (
            <div className="previa__mono" key={i}>
              {parte.split("\n").map((linha, j) => <p className="previa__linha" key={j}>{linha}</p>)}
            </div>
          );
        }
        // o "\n" colado ao bloco só termina a linha: não é linha em branco
        let trecho = parte;
        if (i > 0) trecho = trecho.replace(/^\n/, "");
        if (i < partes.length - 1) trecho = trecho.replace(/\n$/, "");
        return trecho.split("\n").map((linha, j) => (
          <p className="previa__linha" key={`${i}-${j}`}>{linha === "" ? "\u00a0" : negritos(linha)}</p>
        ));
      })}
    </div>
  );
}

function negritos(linha: string): ReactNode[] {
  return linha.split(/(\*[^*]+\*)/).map((trecho, i) =>
    /^\*[^*]+\*$/.test(trecho) ? <strong key={i}>{trecho.slice(1, -1)}</strong> : trecho,
  );
}
