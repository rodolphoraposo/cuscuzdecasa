import type { ReactNode } from "react";

/**
 * Mostra a comanda como ela chega no WhatsApp: *texto* em negrito e o que fica entre ``` em fonte monoespaçada.
 * Tudo vira elementos do React (nada de HTML injetado).
 */
export function PreviaComanda({ texto, rotuloId }: { texto: string; rotuloId: string }) {
  const blocos: ReactNode[] = [];
  let mono: string[] | null = null;

  const linhas = texto.split("\n");
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    if (linha === "```") {
      if (mono === null) {
        mono = [];
      } else {
        blocos.push(
          <div className="previa__mono" key={`m${i}`}>
            {mono.map((l, j) => <p className="previa__linha" key={j}>{l}</p>)}
          </div>,
        );
        mono = null;
      }
    } else if (mono !== null) {
      mono.push(linha);
    } else {
      blocos.push(<p className="previa__linha" key={i}>{linha === "" ? "\u00a0" : negritos(linha)}</p>);
    }
  }

  return (
    <div className="previa" role="group" aria-labelledby={rotuloId}>
      {blocos}
    </div>
  );
}

function negritos(linha: string): ReactNode[] {
  return linha.split(/(\*[^*]+\*)/).map((trecho, i) =>
    /^\*[^*]+\*$/.test(trecho) ? <strong key={i}>{trecho.slice(1, -1)}</strong> : trecho,
  );
}
