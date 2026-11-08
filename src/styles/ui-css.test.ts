// @ts-ignore: o app não depende dos tipos do Node (existem ou não, conforme o ambiente); este teste só lê um arquivo
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ui.css", () => {
  it("o estado 'indeterminado' vale só para checkbox (radio sem seleção também é :indeterminate)", () => {
    const css: string = readFileSync(new URL("./ui.css", import.meta.url), "utf8");
    expect(css.match(/\.choice input(:disabled)?:indeterminate/g)).toBeNull();
    expect(css).toContain('.choice input[type="checkbox"]:indeterminate + .choice__box');
  });

  it("o texto discreto mantém contraste WCAG AA nos fundos claros e escuros", () => {
    const tokens: string = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");
    const cor = (nome: string): string => {
      const valor = tokens.match(new RegExp(`^\\s*${nome}:\\s*(#[\\da-fA-F]{6}|var\\((--[\\w-]+)\\))`, "m"));
      if (!valor) throw new Error(`Token de cor não encontrado: ${nome}`);
      return valor[1].startsWith("#") ? valor[1] : cor(valor[2]);
    };
    const contraste = (primeiro: string, segundo: string) => {
      const luminancia = (hex: string) => {
        const canais = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
        const [r, g, b] = canais.map((canal) =>
          canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4,
        );
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const a = luminancia(primeiro);
      const b = luminancia(segundo);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    };

    for (const fundo of ["--neutro-0", "--neutro-100"]) {
      expect(contraste(cor("--texto-discreto"), cor(fundo))).toBeGreaterThanOrEqual(4.5);
    }
    for (const fundo of ["--neutro-950", "--cafe-900"]) {
      expect(contraste(cor("--neutro-300"), cor(fundo))).toBeGreaterThanOrEqual(4.5);
    }
  });
});
