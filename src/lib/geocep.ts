import { CEP_DE_ORIGEM, coberturaPorDistancia, distanciaEmKm, type Cobertura, type Coordenadas } from "./area";

/**
 * Coordenadas de um CEP pela BrasilAPI (v2), gratuita e sem chave. Os dados vêm do OpenStreetMap, então
 * podem faltar ou ser aproximados: nesses casos a taxa NÃO bloqueia o pedido, ela vira "a confirmar".
 * A resposta é tratada como não confiável: só aceita números dentro do Brasil.
 */
export type ResultadoCoordenadas =
  | { status: "ok"; coordenadas: Coordenadas }
  | { status: "sem-coordenadas" }
  | { status: "falha" };

const TEMPO_LIMITE_MS = 8000;
const LAT_BR = [-34, 6] as const;
const LNG_BR = [-74, -34] as const;

const emFaixa = (n: number, [min, max]: readonly [number, number]) => Number.isFinite(n) && n >= min && n <= max;

const acertos = new Map<string, Coordenadas>();
/** Só para os testes. */
export function limparCacheDeCoordenadas() {
  acertos.clear();
  origemEmAndamento = null;
}

export async function buscarCoordenadas(
  cep: string,
  sinal?: AbortSignal,
  buscar: typeof fetch = (...args) => fetch(...args),
): Promise<ResultadoCoordenadas> {
  const digitos = cep.replace(/\D/g, "");
  if (digitos.length !== 8) return { status: "sem-coordenadas" };
  const guardado = acertos.get(digitos);
  if (guardado) return { status: "ok", coordenadas: guardado };

  const controle = new AbortController();
  const cancelar = () => controle.abort();
  sinal?.addEventListener("abort", cancelar, { once: true });
  const timer = setTimeout(cancelar, TEMPO_LIMITE_MS);

  try {
    const res = await buscar(`https://brasilapi.com.br/api/cep/v2/${digitos}`, {
      signal: controle.signal,
      headers: { Accept: "application/json" },
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
    if (res.status === 404) return { status: "sem-coordenadas" };
    if (!res.ok) return { status: "falha" };

    const dados: unknown = await res.json();
    const c = (dados as { location?: { coordinates?: { latitude?: unknown; longitude?: unknown } } } | null)?.location?.coordinates;
    const lat = Number(c?.latitude);
    const lng = Number(c?.longitude);
    // Number("") é 0: vazio e zero não são coordenada válida.
    if (!c || c.latitude === "" || c.longitude === "" || !emFaixa(lat, LAT_BR) || !emFaixa(lng, LNG_BR)) return { status: "sem-coordenadas" };

    const coordenadas = { lat, lng };
    acertos.set(digitos, coordenadas);
    return { status: "ok", coordenadas };
  } catch {
    return { status: "falha" };
  } finally {
    clearTimeout(timer);
    sinal?.removeEventListener("abort", cancelar);
  }
}

/** O ponto de partida é consultado no mesmo serviço dos clientes: o erro de posição tende a se cancelar. */
let origemEmAndamento: Promise<ResultadoCoordenadas> | null = null;
export function coordenadasDaOrigem(buscar?: typeof fetch): Promise<ResultadoCoordenadas> {
  if (!origemEmAndamento) {
    origemEmAndamento = buscarCoordenadas(CEP_DE_ORIGEM, undefined, buscar).then((r) => {
      if (r.status !== "ok") origemEmAndamento = null; // não guarda falha: tenta de novo na próxima consulta
      return r;
    });
  }
  return origemEmAndamento;
}

/** CEP do cliente → faixa e taxa. Qualquer problema vira "indisponivel" (taxa a confirmar), nunca bloqueio. */
export async function calcularCobertura(cep: string, sinal?: AbortSignal, buscar?: typeof fetch): Promise<Cobertura> {
  const [origem, destino] = await Promise.all([coordenadasDaOrigem(buscar), buscarCoordenadas(cep, sinal, buscar)]);
  if (origem.status !== "ok" || destino.status !== "ok") return { situacao: "indisponivel" };
  return coberturaPorDistancia(distanciaEmKm(origem.coordenadas, destino.coordenadas));
}

export type ResultadoLocalizacao = { ok: true; cobertura: Cobertura } | { ok: false; motivo: "negado" | "indisponivel" };

/** "Estou no endereço da entrega": usa a localização do aparelho (nada é enviado nem guardado). */
export async function calcularCoberturaPorLocalizacao(buscar?: typeof fetch): Promise<ResultadoLocalizacao> {
  const geo = typeof navigator !== "undefined" ? navigator.geolocation : undefined;
  if (!geo) return { ok: false, motivo: "indisponivel" };
  try {
    const posicao = await new Promise<GeolocationPosition>((resolve, reject) =>
      geo.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }),
    );
    const origem = await coordenadasDaOrigem(buscar);
    if (origem.status !== "ok") return { ok: false, motivo: "indisponivel" };
    const aqui = { lat: posicao.coords.latitude, lng: posicao.coords.longitude };
    return { ok: true, cobertura: coberturaPorDistancia(distanciaEmKm(origem.coordenadas, aqui)) };
  } catch (erro) {
    return { ok: false, motivo: (erro as { code?: number })?.code === 1 ? "negado" : "indisponivel" };
  }
}
