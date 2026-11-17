import { describe, expect, it } from "vitest";
import { ANTECEDENCIA_MINIMA_DIAS, dataPorExtenso, encomendaVazia, ehDiaUtil, menorDataDeEncomenda, montarMensagemEncomenda, validarEncomenda, type Encomenda } from "./encomenda";

const terca = new Date("2026-11-17T18:00:00Z"); // 15h em Maceió
const valida: Encomenda = {
  ...encomendaVazia,
  itens: [{ produtoId: "frango-desfiado", qtd: 30 }, { produtoId: "carne-de-sol", qtd: 20 }],
  data: "2026-11-20", faixa: "noite", tipo: "entrega",
  cep: "57046-000", rua: "Rua Exemplo", numero: "120", complemento: "Bloco B", bairro: "Serraria", cidade: "Maceió", uf: "AL",
  nome: "Rodolpho", telefone: "(82) 99433-6126", ocasiao: "Aniversário", pessoas: "25", observacoes: "Sem pimenta",
};
const nome = (id: string) => ({ "frango-desfiado": "Asa Branca", "carne-de-sol": "Do Sertão" })[id] ?? id;

describe("datas da encomenda", () => {
  it("a antecedência mínima é de 2 dias e a primeira data cai em dia útil", () => {
    expect(ANTECEDENCIA_MINIMA_DIAS).toBe(2);
    expect(menorDataDeEncomenda(terca)).toBe("2026-11-19"); // terça + 2 = quinta
    expect(menorDataDeEncomenda(new Date("2026-11-19T18:00:00Z"))).toBe("2026-11-23"); // quinta + 2 = sábado → segunda
    expect(menorDataDeEncomenda(new Date("2026-11-21T18:00:00Z"))).toBe("2026-11-23"); // sábado + 2 = segunda
  });
  it("usa o fuso de Maceió: 01h UTC ainda é o dia anterior aqui", () => {
    expect(menorDataDeEncomenda(new Date("2026-11-17T01:00:00Z"))).toBe("2026-11-18"); // 16/11 22h em Maceió (segunda) + 2 = quarta
  });
  it("dia útil e texto por extenso", () => {
    expect(ehDiaUtil("2026-11-20")).toBe(true);
    expect(ehDiaUtil("2026-11-21")).toBe(false);
    expect(ehDiaUtil("2026-11-22")).toBe(false);
    expect(dataPorExtenso("2026-11-20")).toBe("sexta-feira, 20/11/2026");
  });
});

describe("validar encomenda", () => {
  it("uma encomenda completa não tem erros", () => expect(validarEncomenda(valida, terca)).toEqual({}));

  it("pede item ou descrição; quantidade fora de 1 a 999 é erro", () => {
    expect(validarEncomenda({ ...valida, itens: [{ produtoId: "", qtd: 1 }] }, terca).itens).toMatch(/pelo menos um item/);
    expect(validarEncomenda({ ...valida, itens: [{ produtoId: "", qtd: 1 }], outros: "40 cuscuz de frango" }, terca).itens).toBeUndefined();
    expect(validarEncomenda({ ...valida, itens: [{ produtoId: "carne-de-sol", qtd: 0 }] }, terca).itens).toMatch(/quantidades de 1 a 999/);
    expect(validarEncomenda({ ...valida, itens: [{ produtoId: "carne-de-sol", qtd: 1000 }] }, terca).itens).toBeDefined();
  });

  it("data: obrigatória, com antecedência e só em dia útil", () => {
    expect(validarEncomenda({ ...valida, data: "" }, terca).data).toBe("Escolha a data.");
    expect(validarEncomenda({ ...valida, data: "2026-02-30" }, terca).data).toBe("Escolha a data.");
    expect(validarEncomenda({ ...valida, data: "2026-11-18" }, terca).data).toMatch(/2 dias de antecedência/);
    expect(validarEncomenda({ ...valida, data: "2026-11-21" }, terca).data).toMatch(/segunda a sexta/);
  });

  it("entrega exige endereço; retirada não", () => {
    const e = validarEncomenda({ ...valida, cep: "57", rua: "", numero: "", bairro: "", uf: "A" }, terca);
    expect(Object.keys(e).sort()).toEqual(["bairro", "cep", "numero", "rua", "uf"]);
    expect(validarEncomenda({ ...valida, tipo: "retirada", cep: "", rua: "", numero: "", bairro: "" }, terca)).toEqual({});
  });

  it("nome, telefone, horário e pessoas", () => {
    const e = validarEncomenda({ ...valida, nome: "R", telefone: "(82) 9943", faixa: "", pessoas: "vinte" }, terca);
    expect(Object.keys(e).sort()).toEqual(["faixa", "nome", "pessoas", "telefone"]);
  });
});

describe("mensagem do WhatsApp", () => {
  it("entrega: traz tudo o que a equipe precisa para calcular o valor", () => {
    const m = montarMensagemEncomenda(valida, nome);
    expect(m).toContain("*ENCOMENDA · CUSCUZ DE CASA*");
    expect(m).toContain("*Nome:* Rodolpho");
    expect(m).toContain("*Telefone:* (82) 99433-6126");
    expect(m).toContain("*Para:* sexta-feira, 20/11/2026 · Noite · 17h às 21h");
    expect(m).toContain("*Recebimento:* Entrega");
    expect(m).toContain("*Endereço:* Rua Exemplo, 120, Bloco B · Serraria - Maceió/AL · CEP 57046-000");
    expect(m).toContain("*Itens:*\n• 30× Asa Branca\n• 20× Do Sertão");
    expect(m).toContain("*Ocasião:* Aniversário · *Pessoas:* 25");
    expect(m).toContain("*Observações:* Sem pimenta");
    expect(m.endsWith("Aguardo o valor da encomenda. Obrigado!")).toBe(true);
  });

  it("retirada não leva endereço; descrição livre aparece sem itens", () => {
    const m = montarMensagemEncomenda({ ...valida, tipo: "retirada", itens: [{ produtoId: "", qtd: 1 }], outros: "50 cuscuz variados", ocasiao: "", pessoas: "", observacoes: "" }, nome);
    expect(m).toContain("*Recebimento:* Retirada na casa");
    expect(m).not.toContain("*Endereço:*");
    expect(m).not.toContain("*Itens:*");
    expect(m).toContain("*O que preciso:* 50 cuscuz variados");
  });
});
