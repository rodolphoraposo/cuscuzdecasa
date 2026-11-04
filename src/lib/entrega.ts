import { partes } from "./comanda";

/**
 * Regra de funcionamento TEMPORÁRIA (enquanto não há entregador da casa):
 * pedidos até as 16h, entregas das 17h às 22h, em faixas de 1 hora.
 * Para mudar os horários, altere só estas constantes.
 */
export const LIMITE_PEDIDO_H = 16;
export const ENTREGA_INICIO_H = 17;
export const ENTREGA_FIM_H = 22;
/**
 * ▶ ÚNICO INTERRUPTOR desta regra. O que acontece depois das 16h:
 *   "bloquear" = o site avisa que os pedidos de hoje encerraram e não deixa finalizar;
 *   "amanha"   = o pedido segue normalmente, com a entrega marcada para amanhã.
 * Troque somente o texto entre aspas na linha abaixo (não mexa nas funções mais adiante).
 */
export const APOS_O_LIMITE: "bloquear" | "amanha" = "bloquear";

export interface JanelaEntrega { id: string; rotulo: string }

export const janelasEntrega: JanelaEntrega[] = Array.from({ length: ENTREGA_FIM_H - ENTREGA_INICIO_H }, (_, i) => {
  const h = ENTREGA_INICIO_H + i;
  return { id: `${h}-${h + 1}`, rotulo: `${h}h às ${h + 1}h` };
});

export type DiaEntrega = "hoje" | "amanhã";

/** "hoje" até o limite (horário de Maceió); depois dele, "amanhã" ou null (fechado), conforme APOS_O_LIMITE. */
export function diaDaEntrega(agora: Date, apos: "bloquear" | "amanha" = APOS_O_LIMITE): DiaEntrega | null {
  if (Number(partes(agora).hour) < LIMITE_PEDIDO_H) return "hoje";
  return apos === "amanha" ? "amanhã" : null;
}

export function descricaoEntrega(janelaId: string, dia: DiaEntrega): string {
  const janela = janelasEntrega.find((j) => j.id === janelaId);
  return janela && (dia === "hoje" || dia === "amanhã") ? `${dia}, ${janela.rotulo}` : "";
}
