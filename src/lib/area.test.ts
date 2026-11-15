import { describe, expect, it } from "vitest";
import { FAIXAS_DE_ENTREGA, RAIO_MAXIMO_KM, coberturaPorDistancia, descreverFaixas, distanciaEmKm, formatarDistancia } from "./area";

describe("área de entrega", () => {
  it("o raio é de 1,5 km e as faixas são grátis, R$ 4 e R$ 6", () => {
    expect(RAIO_MAXIMO_KM).toBe(1.5);
    expect(FAIXAS_DE_ENTREGA.map((f) => [f.ateKm, f.taxa])).toEqual([[0.5, 0], [1, 4], [1.5, 6]]);
  });

  it("distância em linha reta: 1° de latitude ≈ 111,2 km; pontos iguais = 0", () => {
    expect(distanciaEmKm({ lat: -9.6, lng: -35.7 }, { lat: -9.6, lng: -35.7 })).toBe(0);
    expect(distanciaEmKm({ lat: -9, lng: -35 }, { lat: -10, lng: -35 })).toBeCloseTo(111.19, 1);
    // 0,0045° de latitude ≈ 500 m
    expect(distanciaEmKm({ lat: -9.6, lng: -35.7 }, { lat: -9.6045, lng: -35.7 })).toBeCloseTo(0.5, 2);
  });

  it("cada faixa vale até o limite, inclusive (0,5 km ainda é grátis)", () => {
    expect(coberturaPorDistancia(0)).toEqual({ situacao: "dentro", distanciaKm: 0, taxa: 0 });
    expect(coberturaPorDistancia(0.5)).toMatchObject({ situacao: "dentro", taxa: 0 });
    expect(coberturaPorDistancia(0.51)).toMatchObject({ situacao: "dentro", taxa: 4 });
    expect(coberturaPorDistancia(1)).toMatchObject({ situacao: "dentro", taxa: 4 });
    expect(coberturaPorDistancia(1.01)).toMatchObject({ situacao: "dentro", taxa: 6 });
    expect(coberturaPorDistancia(1.5)).toMatchObject({ situacao: "dentro", taxa: 6 });
  });

  it("acima de 1,5 km está fora da área; valor inválido vira indisponível", () => {
    expect(coberturaPorDistancia(1.51)).toEqual({ situacao: "fora", distanciaKm: 1.51 });
    expect(coberturaPorDistancia(20)).toMatchObject({ situacao: "fora" });
    for (const ruim of [NaN, Infinity, -1]) expect(coberturaPorDistancia(ruim)).toEqual({ situacao: "indisponivel" });
  });

  it("textos de distância e de faixas", () => {
    expect(formatarDistancia(0.43)).toBe("450 m");
    expect(formatarDistancia(0.02)).toBe("50 m");
    expect(formatarDistancia(1.24)).toBe("1,2 km");
    expect(descreverFaixas((v) => `R$ ${v}`)).toEqual(["Até 500 m: grátis", "De 500 m até 1,0 km: R$ 4", "De 1,0 km até 1,5 km: R$ 6"]);
  });
});
