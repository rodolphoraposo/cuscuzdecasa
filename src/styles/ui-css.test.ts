// @ts-ignore: o app não depende dos tipos do Node (existem ou não, conforme o ambiente); este teste só lê um arquivo
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ui.css", () => {
  it("o estado 'indeterminado' vale só para checkbox (radio sem seleção também é :indeterminate)", () => {
    const css: string = readFileSync(new URL("./ui.css", import.meta.url), "utf8");
    expect(css.match(/\.choice input(:disabled)?:indeterminate/g)).toBeNull();
    expect(css).toContain('.choice input[type="checkbox"]:indeterminate + .choice__box');
  });
});
