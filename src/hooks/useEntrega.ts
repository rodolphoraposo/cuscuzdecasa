import { useEffect, useState } from "react";
import { diaDaEntrega, motivoFechado } from "../lib/entrega";

/** Dia da entrega conforme o horário de agora (atualiza sozinho com a aba aberta). null = pedidos de hoje encerrados. */
export function useEntrega() {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setAgora(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  return { agora, dia: diaDaEntrega(agora), motivo: motivoFechado(agora) };
}
