import { FUSO, partes } from "./comanda";

/**
 * Regra de funcionamento TEMPORÁRIA (enquanto não há entregador da casa):
 * de segunda a sexta, pedidos até as 16h, entregas e retiradas das 17h às 21h, em faixas de 1 hora.
 * Para mudar os horários ou os dias, altere só estas constantes.
 */
export const LIMITE_PEDIDO_H = 18;
export const ENTREGA_INICIO_H = 17;
export const ENTREGA_FIM_H = 21;
/** Dias em que a casa funciona (0 = domingo, 1 = segunda ... 6 = sábado). Para testar num fim de semana, inclua 0 e/ou 6. */
export const DIAS_DE_FUNCIONAMENTO: number[] = [1, 2, 3, 4, 5];
/** Como os dias aparecem nas telas e nos Termos. Mantenha de acordo com DIAS_DE_FUNCIONAMENTO. */
export const TEXTO_DIAS = "segunda a sexta";
/**
 * ▶ ÚNICO INTERRUPTOR desta regra. O que acontece fora do horário (depois das 16h ou num dia sem atendimento):
 *   "bloquear" = o site avisa que não está recebendo pedidos agora e não deixa finalizar;
 *   "amanha"   = o pedido segue normalmente, com a entrega marcada para o próximo dia de funcionamento.
 * Troque somente o texto entre aspas na linha abaixo (não mexa nas funções mais adiante).
 */
export const APOS_O_LIMITE: "bloquear" | "amanha" = "bloquear";

export interface JanelaEntrega { id: string; rotulo: string }

export const janelasEntrega: JanelaEntrega[] = Array.from({ length: ENTREGA_FIM_H - ENTREGA_INICIO_H }, (_, i) => {
  const h = ENTREGA_INICIO_H + i;
  return { id: `${h}-${h + 1}`, rotulo: `${h}h às ${h + 1}h` };
});

const NOMES_DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"] as const;
export type DiaEntrega = "hoje" | "amanhã" | (typeof NOMES_DIAS)[number];

const SEMANA: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Dia da semana em Maceió (0 = domingo ... 6 = sábado), não o do aparelho. */
export function diaDaSemana(data: Date): number {
  return SEMANA[new Intl.DateTimeFormat("en-US", { timeZone: FUSO, weekday: "short" }).format(data)] ?? 0;
}

export type MotivoFechado = "dia-sem-atendimento" | "apos-limite";

/** Por que não dá para pedir para hoje (null = dá). */
export function motivoFechado(agora: Date): MotivoFechado | null {
  if (!DIAS_DE_FUNCIONAMENTO.includes(diaDaSemana(agora))) return "dia-sem-atendimento";
  return Number(partes(agora).hour) >= LIMITE_PEDIDO_H ? "apos-limite" : null;
}

/** "hoje" se está aberto; fora do horário, o próximo dia de funcionamento (ou null = fechado), conforme APOS_O_LIMITE. */
export function diaDaEntrega(agora: Date, apos: "bloquear" | "amanha" = APOS_O_LIMITE): DiaEntrega | null {
  if (motivoFechado(agora) === null) return "hoje";
  if (apos !== "amanha") return null;
  const hoje = diaDaSemana(agora);
  for (let k = 1; k <= 7; k++) {
    const d = (hoje + k) % 7;
    if (DIAS_DE_FUNCIONAMENTO.includes(d)) return k === 1 ? "amanhã" : NOMES_DIAS[d];
  }
  return null;
}

export function descricaoEntrega(janelaId: string, dia: DiaEntrega): string {
  const janela = janelasEntrega.find((j) => j.id === janelaId);
  const valido = dia === "hoje" || dia === "amanhã" || (NOMES_DIAS as readonly string[]).includes(dia);
  return janela && valido ? `${dia}, ${janela.rotulo}` : "";
}
