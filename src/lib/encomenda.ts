import { DIAS_DE_FUNCIONAMENTO, TEXTO_DIAS } from "./entrega";

/**
 * Encomenda (festas, eventos, grandes quantidades): o cliente preenche o formulário, o site monta a mensagem e ela
 * é enviada pelo WhatsApp. O valor é calculado à mão pela equipe: nada aqui calcula preço nem grava pedido.
 * Módulo puro (sem React nem imagens), para rodar em testes.
 */

/** Dias corridos de antecedência mínima. Ajuste conforme a capacidade da cozinha. */
export const ANTECEDENCIA_MINIMA_DIAS = 2;
export const MAX_ITENS = 12;
export const MAX_QTD = 999;

export type FaixaEncomenda = "" | "manha" | "noite" | "combinar";
export const FAIXAS_ENCOMENDA: { id: Exclude<FaixaEncomenda, "">; rotulo: string }[] = [
  { id: "manha", rotulo: "Manhã · 8h às 10h" },
  { id: "noite", rotulo: "Noite · 17h às 21h" },
  { id: "combinar", rotulo: "A combinar pelo WhatsApp" },
];

export interface ItemEncomenda { produtoId: string; qtd: number }

export interface Encomenda {
  itens: ItemEncomenda[];
  outros: string;
  ocasiao: string;
  pessoas: string;
  data: string; // AAAA-MM-DD
  faixa: FaixaEncomenda;
  tipo: "entrega" | "retirada";
  cep: string; rua: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string;
  nome: string; telefone: string;
  observacoes: string;
}

export const encomendaVazia: Encomenda = {
  itens: [{ produtoId: "", qtd: 1 }], outros: "", ocasiao: "", pessoas: "",
  data: "", faixa: "", tipo: "entrega",
  cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "Maceió", uf: "AL",
  nome: "", telefone: "", observacoes: "",
};

export type CampoEncomenda = "itens" | "outros" | "pessoas" | "data" | "faixa" | "cep" | "rua" | "numero" | "bairro" | "cidade" | "uf" | "nome" | "telefone";
export type ErrosEncomenda = Partial<Record<CampoEncomenda, string>>;

// ---------- datas (sempre no fuso de Maceió, sem depender do fuso do aparelho) ----------
const formatoData = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Maceio", year: "numeric", month: "2-digit", day: "2-digit" });
const NOMES_DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

export const hojeISO = (agora: Date) => formatoData.format(agora);
const comoUTC = (iso: string) => new Date(`${iso}T00:00:00Z`);
const dataValida = (iso: string) => /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(comoUTC(iso).getTime()) && comoUTC(iso).toISOString().slice(0, 10) === iso;
const somarDias = (iso: string, n: number) => { const d = comoUTC(iso); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const ehDiaUtil = (iso: string) => DIAS_DE_FUNCIONAMENTO.includes(comoUTC(iso).getUTCDay());

/** Primeira data aceita: hoje + antecedência, passando para o próximo dia de funcionamento se cair no fim de semana. */
export function menorDataDeEncomenda(agora: Date): string {
  let d = somarDias(hojeISO(agora), ANTECEDENCIA_MINIMA_DIAS);
  while (!ehDiaUtil(d)) d = somarDias(d, 1);
  return d;
}

/** "sexta-feira, 20/11/2026" */
export function dataPorExtenso(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${NOMES_DIAS[comoUTC(iso).getUTCDay()]}, ${d}/${m}/${a}`;
}

const digitos = (v: string) => v.replace(/\D/g, "");

export function validarEncomenda(e: Encomenda, agora: Date): ErrosEncomenda {
  const er: ErrosEncomenda = {};
  const qtdValida = (q: number) => Number.isInteger(q) && q >= 1 && q <= MAX_QTD;
  const comProduto = e.itens.filter((i) => i.produtoId);
  if (comProduto.some((i) => !qtdValida(i.qtd))) er.itens = `Use quantidades de 1 a ${MAX_QTD}.`;
  else if (comProduto.length === 0 && e.outros.trim().length < 5) er.itens = "Escolha pelo menos um item ou descreva o que precisa.";
  if (e.pessoas.trim() !== "" && !(/^\d{1,4}$/.test(e.pessoas.trim()) && Number(e.pessoas) >= 1)) er.pessoas = "Informe só números (ex.: 25).";

  if (!dataValida(e.data)) er.data = "Escolha a data.";
  else if (e.data < menorDataDeEncomenda(agora)) er.data = `Precisamos de ${ANTECEDENCIA_MINIMA_DIAS} dias de antecedência. Escolha a partir de ${dataPorExtenso(menorDataDeEncomenda(agora)).split(", ")[1]}.`;
  else if (!ehDiaUtil(e.data)) er.data = `Atendemos de ${TEXTO_DIAS}. Escolha um dia útil.`;
  if (!e.faixa) er.faixa = "Escolha o horário.";

  if (e.tipo === "entrega") {
    if (digitos(e.cep).length !== 8) er.cep = "CEP com 8 números.";
    if (!e.rua.trim()) er.rua = "Informe a rua.";
    if (!e.numero.trim()) er.numero = "Informe o número.";
    if (!e.bairro.trim()) er.bairro = "Informe o bairro.";
    if (!e.cidade.trim()) er.cidade = "Informe a cidade.";
    if (!/^[A-Za-z]{2}$/.test(e.uf.trim())) er.uf = "Use a sigla, como AL.";
  }
  if (e.nome.trim().length < 2) er.nome = "Informe o seu nome.";
  const tel = digitos(e.telefone);
  if (tel.length < 10 || tel.length > 11) er.telefone = "Telefone com DDD, ex.: (82) 99999-9999.";
  return er;
}

/** Mensagem do WhatsApp. `nomeDoProduto` vem da tela (este módulo não conhece o cardápio). */
export function montarMensagemEncomenda(e: Encomenda, nomeDoProduto: (id: string) => string): string {
  const faixa = FAIXAS_ENCOMENDA.find((f) => f.id === e.faixa)?.rotulo ?? "";
  const itens = e.itens.filter((i) => i.produtoId && i.qtd >= 1).map((i) => `• ${i.qtd}× ${nomeDoProduto(i.produtoId)}`);
  const endereco = [
    [e.rua.trim(), e.numero.trim(), e.complemento.trim()].filter(Boolean).join(", "),
    [e.bairro.trim(), [e.cidade.trim(), e.uf.trim().toUpperCase()].filter(Boolean).join("/")].filter(Boolean).join(" - "),
  ].filter(Boolean).join(" · ");

  const linhas = [
    "*ENCOMENDA · CUSCUZ DE CASA*",
    "",
    `*Nome:* ${e.nome.trim()}`,
    `*Telefone:* ${e.telefone.trim()}`,
    `*Para:* ${dataPorExtenso(e.data)} · ${faixa}`,
    `*Recebimento:* ${e.tipo === "retirada" ? "Retirada na casa" : "Entrega"}`,
  ];
  if (e.tipo === "entrega") linhas.push(`*Endereço:* ${endereco} · CEP ${e.cep.trim()}`);
  linhas.push("");
  if (itens.length) linhas.push("*Itens:*", ...itens);
  if (e.outros.trim()) linhas.push(`*${itens.length ? "Outros itens e detalhes" : "O que preciso"}:* ${e.outros.trim()}`);
  const extra = [e.ocasiao.trim() && `*Ocasião:* ${e.ocasiao.trim()}`, e.pessoas.trim() && `*Pessoas:* ${e.pessoas.trim()}`].filter(Boolean);
  if (extra.length) linhas.push("", extra.join(" · "));
  if (e.observacoes.trim()) linhas.push("", `*Observações:* ${e.observacoes.trim()}`);
  linhas.push("", "Aguardo o valor da encomenda. Obrigado!");
  return linhas.join("\n");
}
