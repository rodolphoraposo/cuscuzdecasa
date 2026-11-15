/**
 * Área de entrega e taxa por distância.
 *
 * A distância é em LINHA RETA (raio) entre o ponto de partida e o endereço do cliente, calculada no próprio
 * navegador (fórmula de Haversine): não usa nenhum serviço pago nem envia dados a terceiros.
 * Para mudar a área ou os valores, edite só RAIO_MAXIMO_KM e FAIXAS_DE_ENTREGA.
 */

/** CEP do ponto de partida da entrega (a rua, sem o número: o endereço exato não fica no código). */
export const CEP_DE_ORIGEM = "57046256";

/** Cada faixa vale "até X km" (inclusive). Em ordem crescente. */
export const FAIXAS_DE_ENTREGA: readonly { ateKm: number; taxa: number }[] = [
  { ateKm: 0.5, taxa: 0 },
  { ateKm: 1, taxa: 4 },
  { ateKm: 1.5, taxa: 6 },
];

export const RAIO_MAXIMO_KM = FAIXAS_DE_ENTREGA[FAIXAS_DE_ENTREGA.length - 1].ateKm;

/** Valores de taxa aceitos (usado para validar o rascunho vindo do sessionStorage). */
export const TAXAS_VALIDAS: readonly number[] = FAIXAS_DE_ENTREGA.map((f) => f.taxa);

export interface Coordenadas {
  lat: number;
  lng: number;
}

export type Cobertura =
  | { situacao: "dentro"; distanciaKm: number; taxa: number }
  | { situacao: "fora"; distanciaKm: number }
  /** Não deu para calcular (serviço fora do ar, CEP sem coordenadas…): a taxa é combinada no WhatsApp. */
  | { situacao: "indisponivel" };

const RAIO_DA_TERRA_KM = 6371.0088;
const paraRadianos = (graus: number) => (graus * Math.PI) / 180;

/** Distância em linha reta (km) entre dois pontos. */
export function distanciaEmKm(a: Coordenadas, b: Coordenadas): number {
  const dLat = paraRadianos(b.lat - a.lat);
  const dLng = paraRadianos(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(paraRadianos(a.lat)) * Math.cos(paraRadianos(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RAIO_DA_TERRA_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Taxa para uma distância em km (o limite de cada faixa é inclusivo: exatamente 0,5 km ainda é grátis). */
export function coberturaPorDistancia(km: number): Cobertura {
  if (!Number.isFinite(km) || km < 0) return { situacao: "indisponivel" };
  const faixa = FAIXAS_DE_ENTREGA.find((f) => km <= f.ateKm + 1e-9);
  return faixa ? { situacao: "dentro", distanciaKm: km, taxa: faixa.taxa } : { situacao: "fora", distanciaKm: km };
}

/** "450 m", "1,2 km". Arredonda para não prometer precisão que o CEP não tem. */
export function formatarDistancia(km: number): string {
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`;
  return `${(Math.round(km * 10) / 10).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
}

/** Texto de cada faixa para a Home e os Termos (ex.: "Até 500 m: grátis"). */
export function descreverFaixas(formatarValor: (v: number) => string): string[] {
  return FAIXAS_DE_ENTREGA.map((f, i) => {
    const de = i === 0 ? null : FAIXAS_DE_ENTREGA[i - 1].ateKm;
    const limite = `${de === null ? "Até" : `De ${formatarDistancia(de)} até`} ${formatarDistancia(f.ateKm)}`;
    return `${limite}: ${f.taxa === 0 ? "grátis" : formatarValor(f.taxa)}`;
  });
}
