// @ts-ignore: o app não depende dos tipos do Node (existem ou não, conforme o ambiente); este teste só lê a pasta
import { readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { arquivoDaFoto, produtos } from "./menu";

const PASTA = new URL("../assets/produtos/", import.meta.url);
const LIMITE_KB = 300; // fotos pesadas deixam o cardápio lento no celular

describe("fotos dos produtos", () => {
  it("todo prato e bebida tem foto (.webp com o nome combinado em arquivoDaFoto)", () => {
    const sem = produtos.filter((p) => !p.imagem).map((p) => `${p.nome} → ${arquivoDaFoto[p.id]}.webp`);
    expect(sem, `Faltam fotos em src/assets/produtos: ${sem.join(", ")}`).toEqual([]);
  });

  it(`nenhuma foto passa de ${LIMITE_KB} KB`, () => {
    const pesadas = (readdirSync(PASTA) as string[])
      .filter((f) => f.endsWith(".webp"))
      .map((f) => ({ f, kb: Math.round(statSync(new URL(f, PASTA)).size / 1024) }))
      .filter((x) => x.kb > LIMITE_KB)
      .map((x) => `${x.f} (${x.kb} KB)`);
    expect(pesadas, `Fotos acima de ${LIMITE_KB} KB (reduza o tamanho/qualidade): ${pesadas.join(", ")}`).toEqual([]);
  });
});
