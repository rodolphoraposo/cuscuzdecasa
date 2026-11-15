import type { ReactNode } from "react";
import { formatarDistancia, RAIO_MAXIMO_KM } from "../lib/area";
import { formatarPreco } from "../data/menu";
import { Banner } from "./ui";

export type EstadoEntrega =
  | { tipo: "calculando" }
  | { tipo: "dentro"; distanciaKm: number | null; taxa: number }
  | { tipo: "fora"; distanciaKm: number | null }
  | { tipo: "indisponivel" };

/** Resultado do cálculo de entrega (Home e Seu pedido). `acoes` aparecem abaixo da mensagem. */
export function ResultadoEntrega({ estado, acoes }: { estado: EstadoEntrega; acoes?: ReactNode }) {
  const raio = RAIO_MAXIMO_KM.toLocaleString("pt-BR");
  return (
    <div className="entrega-resultado">
      {estado.tipo === "calculando" && <p className="cep-status" role="status">Calculando a taxa de entrega…</p>}

      {estado.tipo === "dentro" && (
        <Banner tipo="sucesso">
          Entregamos aí! Taxa de entrega: <strong>{estado.taxa === 0 ? "grátis" : formatarPreco(estado.taxa)}</strong>
          {estado.distanciaKm != null && <> (a cerca de {formatarDistancia(estado.distanciaKm)} de nós)</>}.
        </Banner>
      )}

      {estado.tipo === "fora" && (
        <Banner tipo="erro">
          {estado.distanciaKm != null ? <>Esse endereço fica a cerca de {formatarDistancia(estado.distanciaKm)}, fora</> : <>Esse endereço fica fora</>} da nossa
          área de entrega (até {raio} km). Você pode retirar na casa ou falar com a gente no WhatsApp.
        </Banner>
      )}

      {estado.tipo === "indisponivel" && (
        <Banner tipo="aviso">
          Não conseguimos calcular a taxa agora. Você pode continuar: ela será confirmada no WhatsApp antes da entrega.
        </Banner>
      )}

      {acoes && <div className="entrega-resultado__acoes">{acoes}</div>}
    </div>
  );
}
