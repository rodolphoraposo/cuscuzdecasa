import { FUSO, partes } from "./comanda";

/**
 * Regra de funcionamento TEMPORÁRIA (enquanto não há entregador da casa):
 * de segunda a sexta, entregas das 8h às 10h e das 17h às 21h.
 * A manhã é agendada entre 10h e 21h do dia anterior; a noite, entre 22h do dia anterior e 16h do próprio dia.
 * Para mudar os horários ou os dias, altere só estas constantes.
 */
export const LIMITE_PEDIDO_NOITE_H = 16;
export const ABRE_PEDIDOS_NOITE_H = 22;
export const ABRE_PEDIDOS_MANHA_H = 10;
export const FECHA_PEDIDOS_MANHA_H = 21;
export const ENTREGA_INICIO_H = 17;
export const ENTREGA_FIM_H = 21;
/** Dias em que a casa funciona (0 = domingo, 1 = segunda ... 6 = sábado). Para testar num fim de semana, inclua 0 e/ou 6. */
export const DIAS_DE_FUNCIONAMENTO: number[] = [1, 2, 3, 4, 5];
/** Como os dias aparecem nas telas e nos Termos. Mantenha de acordo com DIAS_DE_FUNCIONAMENTO. */
export const TEXTO_DIAS = "segunda a sexta";
export interface JanelaEntrega { id: string; rotulo: string }

const janelasManha: JanelaEntrega[] = [
  { id: "8-9", rotulo: "8h às 9h" },
  { id: "9-10", rotulo: "9h às 10h" },
];

const janelasRegulares: JanelaEntrega[] = Array.from({ length: ENTREGA_FIM_H - ENTREGA_INICIO_H }, (_, i) => {
  const h = ENTREGA_INICIO_H + i;
  return { id: `${h}-${h + 1}`, rotulo: `${h}h às ${h + 1}h` };
});

export type DiaEntrega = "hoje" | "amanhã" | (typeof NOMES_DIAS)[number];
export interface JanelaDisponivel extends JanelaEntrega { dia: DiaEntrega; data: string }

/** Todas as faixas conhecidas, para validar e restaurar um rascunho salvo. */
export const janelasEntrega: JanelaEntrega[] = [...janelasManha, ...janelasRegulares];

const SEMANA: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const NOMES_DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"] as const;

/** Dia da semana em Maceió (0 = domingo ... 6 = sábado), não o do aparelho. */
export function diaDaSemana(data: Date): number {
  return SEMANA[new Intl.DateTimeFormat("en-US", { timeZone: FUSO, weekday: "short" }).format(data)] ?? 0;
}

function dataLocal(agora: Date): string {
  const { year, month, day } = partes(agora);
  return `${year}-${month}-${day}`;
}

function diaDaData(data: string): number {
  return new Date(`${data}T00:00:00Z`).getUTCDay();
}

function somarDias(data: string, dias: number): string {
  const proxima = new Date(`${data}T00:00:00Z`);
  proxima.setUTCDate(proxima.getUTCDate() + dias);
  return proxima.toISOString().slice(0, 10);
}

function ehDiaDeAtendimento(data: string, feriados: readonly string[]): boolean {
  return DIAS_DE_FUNCIONAMENTO.includes(diaDaData(data)) && !feriados.includes(data);
}

function proximoDiaDeAtendimento(data: string, feriados: readonly string[], incluirHoje = false): string {
  for (let dias = incluirHoje ? 0 : 1; dias <= 370; dias++) {
    const candidato = somarDias(data, dias);
    if (ehDiaDeAtendimento(candidato, feriados)) return candidato;
  }
  throw new Error("Não foi possível encontrar um próximo dia de atendimento.");
}

function rotuloDia(data: string, hoje: string): DiaEntrega {
  const diasAte = (Date.parse(`${data}T00:00:00Z`) - Date.parse(`${hoje}T00:00:00Z`)) / 86_400_000;
  if (diasAte === 0) return "hoje";
  if (diasAte === 1) return "amanhã";
  return NOMES_DIAS[diaDaData(data)];
}

/** Disponibilidade calculada no horário de Maceió, sem mostrar pedidos no mesmo dia para o bloco da manhã. */
export function janelasDisponiveis(agora: Date, feriados: readonly string[] = []): JanelaDisponivel[] {
  const hora = Number(partes(agora).hour);
  const hoje = dataLocal(agora);
  const atendeHoje = ehDiaDeAtendimento(hoje, feriados);
  const disponiveis: JanelaDisponivel[] = [];

  if (atendeHoje && hora < LIMITE_PEDIDO_NOITE_H) {
    disponiveis.push(...janelasRegulares.map((j) => ({ ...j, dia: "hoje" as const, data: hoje })));
  }
  if (hora >= ABRE_PEDIDOS_MANHA_H && hora < FECHA_PEDIDOS_MANHA_H) {
    const data = proximoDiaDeAtendimento(hoje, feriados);
    disponiveis.push(...janelasManha.map((j) => ({ ...j, dia: rotuloDia(data, hoje), data })));
  }
  if (hora >= ABRE_PEDIDOS_NOITE_H) {
    const data = proximoDiaDeAtendimento(hoje, feriados);
    disponiveis.push(...janelasRegulares.map((j) => ({ ...j, dia: rotuloDia(data, hoje), data })));
  }
  return disponiveis;
}

export type MotivoFechado = "dia-sem-atendimento" | "feriado" | "fora-da-janela";

/** Explica quando não há entrega hoje ou quando nenhuma faixa pode ser agendada agora. */
export function motivoFechado(agora: Date, feriados: readonly string[] = []): MotivoFechado | null {
  const hoje = dataLocal(agora);
  if (feriados.includes(hoje)) return "feriado";
  if (!DIAS_DE_FUNCIONAMENTO.includes(diaDaSemana(agora))) return "dia-sem-atendimento";
  if (janelasDisponiveis(agora, feriados).length > 0) return null;
  return "fora-da-janela";
}

/** Dia mais próximo disponível para pedido, ou null quando ainda não há horário liberado. */
export function diaDaEntrega(agora: Date, feriados: readonly string[] = []): DiaEntrega | null {
  return janelasDisponiveis(agora, feriados)[0]?.dia ?? null;
}

/** Resolve a data correspondente à faixa escolhida e rejeita opções fora do horário permitido. */
export function diaDaJanela(janelaId: string, agora: Date, feriados: readonly string[] = []): DiaEntrega | null {
  return janelasDisponiveis(agora, feriados).find((j) => j.id === janelaId)?.dia ?? null;
}

export function proximoDiaUtil(agora: Date, feriados: readonly string[] = []): DiaEntrega {
  const hoje = dataLocal(agora);
  const proximo = proximoDiaDeAtendimento(hoje, feriados, !ehDiaDeAtendimento(hoje, feriados));
  return rotuloDia(proximo, hoje);
}

export function descricaoEntrega(janelaId: string, dia: DiaEntrega): string {
  const janela = janelasEntrega.find((j) => j.id === janelaId);
  const valido = dia === "hoje" || dia === "amanhã" || (NOMES_DIAS as readonly string[]).includes(dia);
  return janela && valido ? `${dia}, ${janela.rotulo}` : "";
}
