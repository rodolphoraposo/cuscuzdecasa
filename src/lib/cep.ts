import { limpar } from "./comanda";

export interface EnderecoCep {
  rua: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export type ResultadoCep =
  | { status: "ok"; endereco: EnderecoCep }
  | { status: "nao-encontrado" }
  | { status: "falha" };

const TEMPO_LIMITE_MS = 8000;

/**
 * Consulta o ViaCEP. A resposta é tratada como não confiável: só aceita texto,
 * limpa e limita cada campo. Não envia cookies nem o endereço da página (referrer).
 */
export async function buscarCep(
  cep: string,
  sinal?: AbortSignal,
  buscar: typeof fetch = (...args) => fetch(...args),
): Promise<ResultadoCep> {
  const digitos = cep.replace(/\D/g, "");
  if (digitos.length !== 8) return { status: "nao-encontrado" };

  const controle = new AbortController();
  const cancelar = () => controle.abort();
  sinal?.addEventListener("abort", cancelar, { once: true });
  const timer = setTimeout(cancelar, TEMPO_LIMITE_MS);

  try {
    const res = await buscar(`https://viacep.com.br/ws/${digitos}/json/`, {
      signal: controle.signal,
      headers: { Accept: "application/json" },
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
    if (!res.ok) return { status: "falha" };

    const dados: unknown = await res.json();
    if (typeof dados !== "object" || dados === null) return { status: "falha" };
    const o = dados as Record<string, unknown>;
    if (o.erro === true || o.erro === "true") return { status: "nao-encontrado" };

    const texto = (v: unknown, max: number) => (typeof v === "string" ? limpar(v, max) : "");
    const endereco: EnderecoCep = {
      rua: texto(o.logradouro, 80),
      bairro: texto(o.bairro, 60),
      cidade: texto(o.localidade, 60),
      uf: texto(o.uf, 2).toUpperCase(),
    };
    return endereco.cidade && endereco.uf ? { status: "ok", endereco } : { status: "falha" };
  } catch {
    return { status: "falha" };
  } finally {
    clearTimeout(timer);
    sinal?.removeEventListener("abort", cancelar);
  }
}
