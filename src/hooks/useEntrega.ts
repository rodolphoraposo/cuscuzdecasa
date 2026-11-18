import { useEffect, useState } from "react";
import { diaDaEntrega, motivoFechado, janelasDisponiveis } from "../lib/entrega";
import { partes } from "../lib/comanda";
import { carregarFeriados } from "../lib/feriados";

/** Próximo dia/faixa disponível (atualiza sozinho com a aba aberta). null = nenhum horário liberado. */
export function useEntrega() {
  const [agora, setAgora] = useState(() => new Date());
  const ano = Number(partes(agora).year);
  const [calendario, setCalendario] = useState<{ ano: number; feriados: string[] } | null>(null);
  const [erroCalendario, setErroCalendario] = useState(false);
  useEffect(() => {
    const t = window.setInterval(() => setAgora(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => {
    let ativo = true;
    setCalendario(null);
    setErroCalendario(false);
    Promise.all([carregarFeriados(ano), carregarFeriados(ano + 1)])
      .then(([esteAno, proximoAno]) => {
        if (ativo) setCalendario({ ano, feriados: [...esteAno, ...proximoAno] });
      })
      .catch((erro: unknown) => {
        console.error("Não foi possível carregar o calendário de feriados de Alagoas e Maceió.", erro);
        if (ativo) setErroCalendario(true);
      });
    return () => { ativo = false; };
  }, [ano]);

  const pronto = calendario?.ano === ano;
  const feriados = pronto ? calendario.feriados : [];
  return {
    agora,
    feriados,
    calendarioCarregando: !pronto && !erroCalendario,
    erroCalendario,
    dia: pronto ? diaDaEntrega(agora, feriados) : null,
    motivo: pronto ? motivoFechado(agora, feriados) : null,
    janelas: pronto ? janelasDisponiveis(agora, feriados) : [],
  };
}
