import { beforeEach, describe, expect, it, vi } from "vitest";
import { buscarCoordenadas, calcularCobertura, calcularCoberturaPorLocalizacao, coordenadasDaOrigem, limparCacheDeCoordenadas } from "./geocep";

const resposta = (corpo: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => corpo }) as Response;
const coordenadas = (latitude: unknown, longitude: unknown) => ({ cep: "x", location: { type: "Point", coordinates: { latitude, longitude } } });

// Origem (57046350) ≈ ponto de referência; destinos a ~0,3 / ~0,8 / ~1,3 / ~2,2 km ao norte.
const ORIGEM = { lat: -9.5800, lng: -35.7600 };
const aoNorte = (km: number) => ({ lat: ORIGEM.lat + km / 111.19, lng: ORIGEM.lng });
function servico(destinos: Record<string, unknown>) {
  return vi.fn(async (url: RequestInfo | URL) => {
    const cep = String(url).split("/").pop()!;
    if (cep === "57046350") return resposta(coordenadas(String(ORIGEM.lat), String(ORIGEM.lng)));
    return destinos[cep] === undefined ? resposta({}, 404) : resposta(destinos[cep]);
  }) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
}
const ponto = (km: number) => coordenadas(String(aoNorte(km).lat), String(aoNorte(km).lng));

beforeEach(() => limparCacheDeCoordenadas());

describe("buscarCoordenadas (BrasilAPI v2)", () => {
  it("lê latitude e longitude (texto) e consulta sem cookies nem referrer", async () => {
    const f = servico({ "57010100": coordenadas("-9.66", "-35.73") });
    expect(await buscarCoordenadas("57010-100", undefined, f)).toEqual({ status: "ok", coordenadas: { lat: -9.66, lng: -35.73 } });
    expect(f).toHaveBeenCalledWith("https://brasilapi.com.br/api/cep/v2/57010100", expect.objectContaining({ credentials: "omit", referrerPolicy: "no-referrer" }));
  });

  it("guarda o resultado: o mesmo CEP não é consultado duas vezes", async () => {
    const f = servico({ "57010100": coordenadas("-9.66", "-35.73") });
    await buscarCoordenadas("57010100", undefined, f);
    await buscarCoordenadas("57010100", undefined, f);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("sem coordenadas, vazias, zero ou fora do Brasil → sem-coordenadas; CEP inexistente (404) também", async () => {
    for (const corpo of [{}, { location: {} }, coordenadas("", ""), coordenadas("0", "0"), coordenadas("48.85", "2.35"), coordenadas("abc", "def"), coordenadas(null, null)]) {
      expect(await buscarCoordenadas("57010100", undefined, vi.fn(async () => resposta(corpo)) as unknown as typeof fetch)).toEqual({ status: "sem-coordenadas" });
    }
    expect(await buscarCoordenadas("57010100", undefined, vi.fn(async () => resposta({}, 404)) as unknown as typeof fetch)).toEqual({ status: "sem-coordenadas" });
  });

  it("erro de servidor, rede ou resposta que não é JSON → falha; CEP incompleto nem consulta", async () => {
    expect(await buscarCoordenadas("57010100", undefined, vi.fn(async () => resposta({}, 500)) as unknown as typeof fetch)).toEqual({ status: "falha" });
    expect(await buscarCoordenadas("57010100", undefined, vi.fn(async () => { throw new Error("rede"); }) as unknown as typeof fetch)).toEqual({ status: "falha" });
    const f = vi.fn() as unknown as typeof fetch;
    expect(await buscarCoordenadas("5701", undefined, f)).toEqual({ status: "sem-coordenadas" });
    expect(f).not.toHaveBeenCalled();
  });
});

describe("calcularCobertura", () => {
  it.each([
    [0.3, 0], [0.8, 4], [1.3, 6],
  ])("a ~%s km: dentro da área, taxa R$ %s", async (km, taxa) => {
    const f = servico({ "57010100": ponto(km) });
    const c = await calcularCobertura("57010100", undefined, f);
    expect(c).toMatchObject({ situacao: "dentro", taxa });
    if (c.situacao === "dentro") expect(c.distanciaKm).toBeCloseTo(km, 1);
  });

  it("a ~2,2 km: fora da área", async () => {
    expect(await calcularCobertura("57010100", undefined, servico({ "57010100": ponto(2.2) }))).toMatchObject({ situacao: "fora" });
  });

  it("CEP sem coordenadas, serviço fora do ar ou origem sem coordenadas → indisponível (nunca bloqueia)", async () => {
    expect(await calcularCobertura("57010100", undefined, servico({}))).toEqual({ situacao: "indisponivel" });
    expect(await calcularCobertura("57010100", undefined, vi.fn(async () => { throw new Error("rede"); }) as unknown as typeof fetch)).toEqual({ situacao: "indisponivel" });
  });

  it("a origem é consultada uma vez só e uma falha não fica guardada", async () => {
    const f = servico({ "57010100": ponto(0.3), "57010200": ponto(0.8) });
    await calcularCobertura("57010100", undefined, f);
    await calcularCobertura("57010200", undefined, f);
    expect(f.mock.calls.filter((c) => String(c[0]).endsWith("57046350"))).toHaveLength(1);

    limparCacheDeCoordenadas();
    let falhar = true;
    const g = vi.fn(async () => { if (falhar) throw new Error("rede"); return resposta(coordenadas(String(ORIGEM.lat), String(ORIGEM.lng))); }) as unknown as typeof fetch;
    expect((await coordenadasDaOrigem(g)).status).toBe("falha");
    falhar = false;
    expect((await coordenadasDaOrigem(g)).status).toBe("ok");
  });
});

describe("calcularCoberturaPorLocalizacao", () => {
  const posicao = (lat: number, lng: number) => ({ coords: { latitude: lat, longitude: lng } }) as GeolocationPosition;
  const geo = (impl: Geolocation["getCurrentPosition"]) => vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: impl } });

  it("usa a posição do aparelho e calcula a faixa", async () => {
    geo((ok) => ok(posicao(aoNorte(0.8).lat, aoNorte(0.8).lng)));
    const r = await calcularCoberturaPorLocalizacao(servico({}));
    expect(r).toMatchObject({ ok: true, cobertura: { situacao: "dentro", taxa: 4 } });
  });

  it("permissão negada e aparelho sem localização têm motivos diferentes", async () => {
    geo((_ok, erro) => erro?.({ code: 1 } as GeolocationPositionError));
    expect(await calcularCoberturaPorLocalizacao(servico({}))).toEqual({ ok: false, motivo: "negado" });
    vi.stubGlobal("navigator", {});
    expect(await calcularCoberturaPorLocalizacao(servico({}))).toEqual({ ok: false, motivo: "indisponivel" });
  });
});
