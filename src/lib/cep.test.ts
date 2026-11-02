import { describe, expect, it, vi } from "vitest";
import { buscarCep } from "./cep";

const resposta = (corpo: unknown, ok = true) => ({ ok, json: async () => corpo }) as Response;
const falso = (r: Response | Error) =>
  vi.fn(async () => { if (r instanceof Error) throw r; return r; }) as unknown as typeof fetch & ReturnType<typeof vi.fn>;

describe("buscarCep", () => {
  it("devolve o endereço limpo e consulta com segurança", async () => {
    const f = falso(resposta({ logradouro: "Rua *Exemplo*", bairro: "Serraria", localidade: "Maceió", uf: "al" }));
    expect(await buscarCep("57046-000", undefined, f)).toEqual({
      status: "ok", endereco: { rua: "Rua Exemplo", bairro: "Serraria", cidade: "Maceió", uf: "AL" },
    });
    expect(f).toHaveBeenCalledWith("https://viacep.com.br/ws/57046000/json/", expect.objectContaining({ credentials: "omit", referrerPolicy: "no-referrer" }));
  });
  it("CEP inexistente (erro true ou \"true\")", async () => {
    expect((await buscarCep("00000000", undefined, falso(resposta({ erro: true })))).status).toBe("nao-encontrado");
    expect((await buscarCep("00000000", undefined, falso(resposta({ erro: "true" })))).status).toBe("nao-encontrado");
  });
  it("CEP incompleto nem chega a consultar", async () => {
    const f = falso(resposta({}));
    expect((await buscarCep("5704", undefined, f)).status).toBe("nao-encontrado");
    expect(f).not.toHaveBeenCalled();
  });
  it("falha de rede, HTTP de erro e resposta inesperada viram \"falha\"", async () => {
    expect((await buscarCep("57046000", undefined, falso(new Error("rede")))).status).toBe("falha");
    expect((await buscarCep("57046000", undefined, falso(resposta({}, false)))).status).toBe("falha");
    expect((await buscarCep("57046000", undefined, falso(resposta("texto")))).status).toBe("falha");
    expect((await buscarCep("57046000", undefined, falso(resposta({ logradouro: "Rua A" })))).status).toBe("falha");
  });
  it("ignora campos que não são texto", async () => {
    const r = await buscarCep("57046000", undefined, falso(resposta({ logradouro: { x: 1 }, localidade: "Maceió", uf: "AL" })));
    expect(r).toEqual({ status: "ok", endereco: { rua: "", bairro: "", cidade: "Maceió", uf: "AL" } });
  });
});
