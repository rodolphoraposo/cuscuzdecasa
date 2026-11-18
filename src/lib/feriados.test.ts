import { afterEach, describe, expect, it, vi } from "vitest";
import { carregarFeriados } from "./feriados";

afterEach(() => vi.unstubAllGlobals());

describe("calendário de feriados de Alagoas e Maceió", () => {
  it("consulta o calendário do ano, estado e município e retorna as datas", async () => {
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ feriados: [{ data: "2098-04-09" }, { data: "2098-09-16" }] }),
    }));
    vi.stubGlobal("fetch", fetch);

    await expect(carregarFeriados(2098)).resolves.toEqual(["2098-04-09", "2098-09-16"]);
    expect(fetch).toHaveBeenCalledWith(
      "/api/feriados?ano=2098&uf=AL&municipio=Macei%C3%B3",
    );
  });

  it("rejeita respostas inválidas e datas fora do ano consultado", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ feriados: [{ data: "2099-12-31" }, { data: "2100-01-01" }] }),
    })));

    await expect(carregarFeriados(2099)).rejects.toThrow("data inválida");
  });
});
