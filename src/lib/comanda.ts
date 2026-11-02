/**
 * Gera a comanda de WhatsApp (formato definido pelo Rodolpho).
 * Módulo puro: não importa imagens nem React, então roda em testes.
 */

export type FormaPagamento = "pix" | "dinheiro" | "cartao";

const ROTULO_PAGAMENTO: Record<FormaPagamento, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao: "Cartão na entrega",
};

export interface ItemComanda {
  nome: string;
  quantidade: number;
  /** Nomes dos adicionais escolhidos */
  extras: string[];
  /** Total da linha (preço unitário com adicionais × quantidade) */
  subtotal: number;
}

export interface DadosPedido {
  nome: string;
  telefone: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  referencia?: string;
  pagamento: FormaPagamento;
  /** Só para dinheiro: valor da nota. null/undefined = não precisa de troco. */
  trocoPara?: number | null;
  observacoes?: string;
}

export interface TotaisPedido {
  subtotal: number;
  entrega: number;
  total: number;
}

const FUSO = "America/Maceio";

/** Moeda com espaço comum (o NBSP do Intl quebra a formatação no WhatsApp). */
export const brl = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/\u00a0/g, " ");

const digitos = (texto: string) => texto.replace(/\D/g, "");

/**
 * Texto digitado pelo cliente vai para uma mensagem formatada: remove caracteres de controle,
 * marcas de direção invisíveis e os símbolos de formatação do WhatsApp (* _ ~ `).
 */
export function limpar(texto: string | undefined, max: number): string {
  return (texto ?? "")
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, " ")
    .replace(/[*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function partes(data: Date) {
  const f = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  return Object.fromEntries(f.formatToParts(data).map((p) => [p.type, p.value])) as Record<string, string>;
}

/** CC-DDMM-HHMM, sempre no horário de Maceió (não depende do relógio do aparelho). */
export function codigoPedido(data: Date): string {
  const p = partes(data);
  return `CC-${p.day}${p.month}-${p.hour}${p.minute}`;
}

export function dataHora(data: Date): string {
  const p = partes(data);
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}

export function formatarTelefone(valor: string): string {
  const d = digitos(valor);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return limpar(valor, 20);
}

export function formatarCep(valor: string): string {
  const d = digitos(valor);
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : limpar(valor, 10);
}

export function montarComanda(
  pedido: DadosPedido,
  itens: ItemComanda[],
  totais: TotaisPedido,
  agora: Date = new Date(),
): { codigo: string; texto: string } {
  if (itens.length === 0) throw new RangeError("Pedido sem itens");

  const codigo = codigoPedido(agora);

  const rotulos = itens.map((i) => `${i.quantidade}x ${limpar(i.nome, 40)}`);
  const largura = Math.max(...rotulos.map((r) => r.length));
  const linhasItens = itens.flatMap((item, n) => {
    const pontos = ".".repeat(largura - rotulos[n].length + 2);
    return [`${rotulos[n]} ${pontos} ${brl(item.subtotal)}`, ...item.extras.map((e) => `   + ${limpar(e, 40)}`)];
  });

  const referencia = limpar(pedido.referencia, 80);
  const observacoes = limpar(pedido.observacoes, 300);

  let pagamento = `*PAGAMENTO:* ${ROTULO_PAGAMENTO[pedido.pagamento]}`;
  if (pedido.pagamento === "dinheiro") {
    if (pedido.trocoPara == null) {
      pagamento += "\nTroco: não precisa";
    } else {
      if (pedido.trocoPara < totais.total) throw new RangeError("Troco menor que o total do pedido");
      const levar = Math.round((pedido.trocoPara - totais.total) * 100) / 100;
      pagamento += `\nTroco para: ${brl(pedido.trocoPara)} (levar ${brl(levar)})`;
    }
  }

  const blocos = [
    `*COMANDA · CUSCUZ DE CASA*\nPedido ${codigo} · ${dataHora(agora)}`,
    `*CLIENTE*\n${limpar(pedido.nome, 80)}\nTel: ${formatarTelefone(pedido.telefone)}`,
    [
      "*ENTREGA*",
      `${limpar(pedido.rua, 80)}, ${limpar(pedido.numero, 10)} - ${limpar(pedido.bairro, 60)}`,
      `${limpar(pedido.cidade, 60)}/${limpar(pedido.uf, 2).toUpperCase()} · CEP ${formatarCep(pedido.cep)}`,
      `Compl.: ${limpar(pedido.complemento, 60)}`,
      ...(referencia ? [`Ref.: ${referencia}`] : []),
    ].join("\n"),
    `*ITENS*\n${linhasItens.join("\n")}`,
    `*Subtotal:* ${brl(totais.subtotal)}\n*Entrega:* ${brl(totais.entrega)}\n*TOTAL:* ${brl(totais.total)}`,
    pagamento,
    ...(observacoes ? [`*OBS:* ${observacoes}`] : []),
  ];

  return { codigo, texto: blocos.join("\n\n") };
}

export function linkWhatsApp(numero: string, texto: string): string {
  return `https://wa.me/${digitos(numero)}?text=${encodeURIComponent(texto)}`;
}
