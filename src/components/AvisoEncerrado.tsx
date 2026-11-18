import { useEntrega } from "../hooks/useEntrega";
import { proximoDiaUtil } from "../lib/entrega";
import { Banner } from "./ui";

/** Informa os dias sem entrega e quando cada bloco de horários fica indisponível. */
export function AvisoEncerrado() {
  const { agora, feriados, motivo, calendarioCarregando, erroCalendario } = useEntrega();
  if (calendarioCarregando) {
    return <div className="aviso-encerrado"><Banner tipo="aviso">Consultando o calendário de feriados para mostrar os horários disponíveis...</Banner></div>;
  }
  if (erroCalendario) {
    return <div className="aviso-encerrado"><Banner tipo="erro">Não foi possível consultar os feriados. Tente novamente mais tarde para confirmar os horários de entrega.</Banner></div>;
  }
  if (!motivo) return null;

  const proximo = proximoDiaUtil(agora, feriados);
  return (
    <div className="aviso-encerrado">
      <Banner tipo="aviso">
        {motivo === "feriado" || motivo === "dia-sem-atendimento"
          ? `Hoje não há entregas${motivo === "feriado" ? " por causa do feriado" : " no fim de semana"}. Voltamos ${proximo === "amanhã" ? "amanhã" : `na ${proximo}`}.`
          : `Nenhum horário está disponível agora. A manhã abre das 10h às 21h para o próximo dia útil; a noite, das 22h do dia anterior às 16h do próprio dia.`}
      </Banner>
    </div>
  );
}
