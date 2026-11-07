import { janelasEntrega } from "./entrega";
import { brl, limpar, type DadosPedido, type FormaPagamento, type TipoPedido } from "./comanda";

export interface Rascunho {
  /** Delivery (padrão, sempre o primeiro) ou retirada na casa */
  tipo: TipoPedido;
  nome: string;
  telefone: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  horario: string;
  referencia: string;
  pagamento: FormaPagamento | "";
  trocoTexto: string;
  semTroco: boolean;
  observacoes: string;
}

export const rascunhoVazio: Rascunho = {
  tipo: "entrega",
  nome: "", telefone: "", cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "",
  horario: "", referencia: "", pagamento: "", trocoTexto: "", semTroco: false, observacoes: "",
};

export type Campo =
  | "nome" | "telefone" | "cep" | "rua" | "numero" | "complemento" | "bairro" | "cidade" | "uf"
  | "horario" | "pagamento" | "trocoTexto";
export type Erros = Partial<Record<Campo, string>>;

const UFS = new Set(
  "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" "),
);
const FORMAS: readonly string[] = ["pix", "dinheiro", "cartao"];
const digitos = (texto: string) => texto.replace(/\D/g, "");

export function mascararTelefone(valor: string): string {
  const d = digitos(valor).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function mascararCep(valor: string): string {
  const d = digitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** "50", "R$ 50,00", "1.000,50" → número. Inválido ou ≤ 0 → null. */
export function valorEmReais(texto: string): number | null {
  let s = texto.replace(/[^\d,.]/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (!/^\d+\.\d{1,2}$/.test(s)) s = s.replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

export function validarPedido(r: Rascunho, total: number): Erros {
  const e: Erros = {};
  if (limpar(r.nome, 80).length < 2) e.nome = "Informe seu nome.";

  const tel = digitos(r.telefone);
  const telOk = (tel.length === 10 || tel.length === 11) && Number(tel.slice(0, 2)) >= 11 && (tel.length === 10 || tel[2] === "9");
  if (!telOk) e.telefone = "Informe um WhatsApp com DDD, como (82) 99999-9999.";

  if (r.tipo !== "retirada") { // na retirada não há endereço
  if (digitos(r.cep).length !== 8) e.cep = "Informe um CEP com 8 números.";
  if (limpar(r.rua, 80).length < 3) e.rua = "Informe a rua, condomínio ou residencial.";
  if (!limpar(r.numero, 10)) e.numero = "Informe o número (ou S/N).";
  if (!limpar(r.complemento, 60)) e.complemento = "Informe bloco e apto, ou escreva Casa.";
  if (limpar(r.bairro, 60).length < 2) e.bairro = "Informe o bairro.";
  if (limpar(r.cidade, 60).length < 2) e.cidade = "Informe a cidade.";
  if (!UFS.has(r.uf.trim().toUpperCase())) e.uf = "Use a sigla, como AL.";
  }
  if (!janelasEntrega.some((j) => j.id === r.horario)) e.horario = r.tipo === "retirada" ? "Escolha o horário de retirada." : "Escolha o horário de entrega.";
  if (!r.pagamento) e.pagamento = "Escolha a forma de pagamento.";

  if (r.pagamento === "dinheiro" && !r.semTroco) {
    const valor = valorEmReais(r.trocoTexto);
    if (valor === null) e.trocoTexto = "Informe o valor ou marque “Não precisa de troco”.";
    else if (valor < total) e.trocoTexto = `O valor deve ser pelo menos ${brl(total)}.`;
    else if (valor > 1000) e.trocoTexto = "Informe um valor de até R$ 1.000,00.";
  }
  return e;
}

export function paraDadosPedido(r: Rascunho): DadosPedido {
  const trocoPara = r.pagamento === "dinheiro" && !r.semTroco ? valorEmReais(r.trocoTexto) : null;
  return { ...r, pagamento: r.pagamento as FormaPagamento, trocoPara };
}

/** Rascunho vem do sessionStorage (entrada não confiável): aceita só o formato esperado. */
export function sanearRascunho(bruto: unknown): Rascunho {
  if (typeof bruto !== "object" || bruto === null) return { ...rascunhoVazio };
  const o = bruto as Record<string, unknown>;
  const texto = (k: keyof Rascunho) => (typeof o[k] === "string" ? (o[k] as string).slice(0, 300) : "");
  return {
    nome: texto("nome"), telefone: texto("telefone"), cep: texto("cep"), rua: texto("rua"), numero: texto("numero"),
    complemento: texto("complemento"), bairro: texto("bairro"), cidade: texto("cidade"), uf: texto("uf"),
    referencia: texto("referencia"), trocoTexto: texto("trocoTexto"), observacoes: texto("observacoes"),
    semTroco: o.semTroco === true,
    tipo: o.tipo === "retirada" ? "retirada" : "entrega",
    horario: janelasEntrega.some((j) => j.id === o.horario) ? (o.horario as string) : "",
    pagamento: FORMAS.includes(o.pagamento as string) ? (o.pagamento as FormaPagamento) : "",
  };
}

/* sessionStorage: os dados pessoais somem ao fechar a aba (minimização, LGPD). */
const CHAVE = "cuscuz-rascunho-v1";

export function carregarRascunho(): Rascunho {
  try {
    return sanearRascunho(JSON.parse(sessionStorage.getItem(CHAVE) ?? "null"));
  } catch {
    return { ...rascunhoVazio };
  }
}
export function salvarRascunho(r: Rascunho) {
  try { sessionStorage.setItem(CHAVE, JSON.stringify(r)); } catch { /* segue em memória */ }
}
export function limparRascunho() {
  try { sessionStorage.removeItem(CHAVE); } catch { /* nada a limpar */ }
}
