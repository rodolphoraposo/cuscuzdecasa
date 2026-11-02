import { describe, expect, it } from "vitest";
import { origemSegura } from "./navegacao";

describe("origemSegura", () => {
  it.each(["/", "/cardapio", "/cardapio?categoria=doces&vista=grade"])("aceita %s", (v) => {
    expect(origemSegura({ voltar: v })).toBe(v);
  });
  it.each(["//evil.com", "/\\evil.com", "https://evil.com", "javascript:alert(1)", "cardapio", "/a b", 42, null, undefined])(
    "recusa %j",
    (v) => expect(origemSegura({ voltar: v })).toBeNull(),
  );
  it("sem state, null", () => {
    expect(origemSegura(undefined)).toBeNull();
    expect(origemSegura(null)).toBeNull();
  });
});
