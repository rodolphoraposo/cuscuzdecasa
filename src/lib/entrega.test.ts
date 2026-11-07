import { describe, expect, it } from "vitest";
import { descricaoEntrega, diaDaEntrega, diaDaSemana, janelasEntrega, motivoFechado } from "./entrega";

describe("regra de entrega", () => {
  it("faixas de 1 hora, das 17h às 21h", () => {
    expect(janelasEntrega.map((j) => j.rotulo)).toEqual(["17h às 18h", "18h às 19h", "19h às 20h", "20h às 21h"]);
  });
  it("pedidos até as 16h (horário de Maceió); depois, encerrado", () => {
    expect(diaDaEntrega(new Date("2026-11-03T18:59:59Z"))).toBe("hoje"); // 15:59:59
    expect(diaDaEntrega(new Date("2026-11-03T19:00:00Z"))).toBeNull(); // 16:00:00
    expect(diaDaEntrega(new Date("2026-11-04T02:00:00Z"))).toBeNull(); // 23:00
    expect(diaDaEntrega(new Date("2026-11-04T03:00:00Z"))).toBe("hoje"); // 00:00 do dia seguinte
  });
  it("modo \"amanha\": depois das 16h a entrega é amanhã; qualquer outro valor nunca vaza para a comanda", () => {
    const tarde = new Date("2026-11-03T20:00:00Z"); // 17:00
    expect(diaDaEntrega(tarde, "amanha")).toBe("amanhã");
    expect(diaDaEntrega(tarde, "bloquear")).toBeNull();
    expect(descricaoEntrega("18-19", "amanhã")).toBe("amanhã, 18h às 19h");
    expect(descricaoEntrega("18-19", true as unknown as "hoje")).toBe("");
  });
  it("descrição da entrega para a comanda", () => {
    expect(descricaoEntrega("18-19", "hoje")).toBe("hoje, 18h às 19h");
    expect(descricaoEntrega("99-00", "hoje")).toBe("");
  });

  it("só funciona de segunda a sexta (o dia da semana é o de Maceió)", () => {
    const sabado = new Date("2026-11-07T15:00:00Z"); // 12:00
    expect(diaDaSemana(new Date("2026-11-03T18:00:00Z"))).toBe(2); // terça
    expect(diaDaSemana(sabado)).toBe(6);
    expect(diaDaSemana(new Date("2026-11-09T02:30:00Z"))).toBe(0); // 23:30 de domingo em Maceió
    expect(motivoFechado(sabado)).toBe("dia-sem-atendimento");
    expect(diaDaEntrega(sabado)).toBeNull();
    expect(motivoFechado(new Date("2026-11-03T20:00:00Z"))).toBe("apos-limite"); // terça, 17:00
    expect(motivoFechado(new Date("2026-11-03T18:00:00Z"))).toBeNull(); // terça, 15:00
  });
  it("modo \"amanha\": sexta à tarde e fim de semana levam para segunda-feira", () => {
    expect(diaDaEntrega(new Date("2026-11-05T20:00:00Z"), "amanha")).toBe("amanhã"); // quinta 17:00
    expect(diaDaEntrega(new Date("2026-11-06T20:00:00Z"), "amanha")).toBe("segunda-feira"); // sexta 17:00
    expect(diaDaEntrega(new Date("2026-11-07T15:00:00Z"), "amanha")).toBe("segunda-feira"); // sábado
    expect(diaDaEntrega(new Date("2026-11-08T15:00:00Z"), "amanha")).toBe("amanhã"); // domingo
    expect(descricaoEntrega("18-19", "segunda-feira")).toBe("segunda-feira, 18h às 19h");
  });
});
