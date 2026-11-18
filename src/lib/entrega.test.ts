import { describe, expect, it } from "vitest";
import { descricaoEntrega, diaDaEntrega, diaDaJanela, diaDaSemana, janelasDisponiveis, janelasEntrega, motivoFechado } from "./entrega";

describe("regra de entrega", () => {
  it("conhece as faixas da manhã e da noite", () => {
    expect(janelasEntrega.map((j) => j.rotulo)).toEqual(["8h às 9h", "9h às 10h", "17h às 18h", "18h às 19h", "19h às 20h", "20h às 21h"]);
  });
  it("a noite de hoje fecha às 16h e o próximo bloco noturno abre às 22h", () => {
    expect(diaDaEntrega(new Date("2026-11-03T18:59:59Z"))).toBe("hoje"); // 15:59:59
    expect(diaDaEntrega(new Date("2026-11-03T19:00:00Z"))).toBe("amanhã"); // 16:00:00
    expect(diaDaEntrega(new Date("2026-11-04T02:00:00Z"))).toBe("amanhã"); // 23:00
    expect(diaDaEntrega(new Date("2026-11-04T03:00:00Z"))).toBe("hoje"); // 00:00 do dia seguinte
    expect(janelasDisponiveis(new Date("2026-11-03T19:00:00Z")).map((j) => j.id)).toEqual(["8-9", "9-10"]);
    expect(janelasDisponiveis(new Date("2026-11-04T00:59:59Z"))).toEqual([]);
    expect(janelasDisponiveis(new Date("2026-11-04T01:00:00Z")).map((j) => [j.id, j.dia])).toEqual([
      ["17-18", "amanhã"], ["18-19", "amanhã"], ["19-20", "amanhã"], ["20-21", "amanhã"],
    ]);
  });
  it("a manhã só aparece das 10h às 21h para o próximo dia útil", () => {
    const antesDasDez = new Date("2026-11-03T12:59:59Z"); // 09:59:59
    const aPartirDasDez = new Date("2026-11-03T13:00:00Z"); // 10:00:00
    expect(janelasDisponiveis(antesDasDez).map((j) => j.id)).toEqual(["17-18", "18-19", "19-20", "20-21"]);
    expect(janelasDisponiveis(aPartirDasDez).map((j) => [j.id, j.dia])).toEqual([
      ["17-18", "hoje"], ["18-19", "hoje"], ["19-20", "hoje"], ["20-21", "hoje"], ["8-9", "amanhã"], ["9-10", "amanhã"],
    ]);
    expect(janelasDisponiveis(new Date("2026-11-04T00:00:00Z"))).toEqual([]);
    expect(janelasDisponiveis(new Date("2026-11-04T00:00:00Z")).some((j) => j.id === "8-9")).toBe(false);
    expect(janelasDisponiveis(new Date("2026-11-04T03:00:00Z")).map((j) => j.id)).toEqual(["17-18", "18-19", "19-20", "20-21"]);
    expect(diaDaJanela("8-9", antesDasDez)).toBeNull();
    expect(diaDaJanela("8-9", aPartirDasDez)).toBe("amanhã");
    expect(descricaoEntrega("8-9", "amanhã")).toBe("amanhã, 8h às 9h");
    expect(descricaoEntrega("18-19", true as unknown as "hoje")).toBe("");
  });
  it("descrição da entrega para a comanda", () => {
    expect(descricaoEntrega("18-19", "hoje")).toBe("hoje, 18h às 19h");
    expect(descricaoEntrega("99-00", "hoje")).toBe("");
  });

  it("não entrega em fins de semana, mas agenda o próximo dia útil nas janelas correspondentes", () => {
    const sabado = new Date("2026-11-07T15:00:00Z"); // 12:00
    expect(diaDaSemana(new Date("2026-11-03T18:00:00Z"))).toBe(2); // terça
    expect(diaDaSemana(sabado)).toBe(6);
    expect(diaDaSemana(new Date("2026-11-09T02:30:00Z"))).toBe(0); // 23:30 de domingo em Maceió
    expect(motivoFechado(new Date("2026-11-07T10:00:00Z"))).toBe("dia-sem-atendimento"); // sábado, 07:00
    expect(motivoFechado(sabado)).toBe("dia-sem-atendimento");
    expect(janelasDisponiveis(sabado).map((j) => [j.id, j.dia])).toEqual([["8-9", "segunda-feira"], ["9-10", "segunda-feira"]]);
    expect(diaDaEntrega(sabado)).toBe("segunda-feira");
    expect(motivoFechado(new Date("2026-11-04T00:00:00Z"))).toBe("fora-da-janela"); // terça, 21:00
    expect(motivoFechado(new Date("2026-11-03T18:00:00Z"))).toBeNull(); // terça, 15:00
  });
  it("sexta após as 10h e sábado após as 10h levam a manhã de segunda-feira", () => {
    expect(diaDaEntrega(new Date("2026-11-06T20:00:00Z"))).toBe("segunda-feira"); // sexta 17:00
    expect(diaDaEntrega(new Date("2026-11-07T15:00:00Z"))).toBe("segunda-feira"); // sábado
    expect(diaDaEntrega(new Date("2026-11-08T15:00:00Z"))).toBe("amanhã"); // domingo
    expect(descricaoEntrega("18-19", "segunda-feira")).toBe("segunda-feira, 18h às 19h");
  });
  it("pula feriados ao escolher o próximo dia útil para os dois blocos", () => {
    const feriados = ["2026-11-04"];
    const antesDasDez = new Date("2026-11-03T13:00:00Z"); // terça 10h
    const noite = new Date("2026-11-04T01:00:00Z"); // terça 22h
    expect(janelasDisponiveis(antesDasDez, feriados).filter((j) => j.id === "8-9").map((j) => [j.data, j.dia])).toEqual([["2026-11-05", "quinta-feira"]]);
    expect(janelasDisponiveis(noite, feriados).filter((j) => j.id === "17-18").map((j) => [j.data, j.dia])).toEqual([["2026-11-05", "quinta-feira"]]);
    expect(motivoFechado(new Date("2026-11-04T15:00:00Z"), feriados)).toBe("feriado");
  });
});
