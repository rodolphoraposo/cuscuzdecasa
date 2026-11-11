import { useEntrega } from "../hooks/useEntrega";
import { contato } from "../data/menu";
import { Banner } from "./ui";

/** Avisa cedo (cardápio e pedido) que hoje não dá para pedir: dia sem atendimento ou depois do limite. */
export function AvisoEncerrado() {
  const { dia, motivo } = useEntrega();
  if (dia !== null) return null;
  return (
    <div className="aviso-encerrado">
      <Banner tipo="aviso">
        {motivo === "dia-sem-atendimento"
          ? `Hoje a casa não funciona. Atendemos de ${contato.diasFuncionamento}, com pedidos até as ${contato.horarioPedidos}. Você pode ver o cardápio e voltar no próximo dia de funcionamento!`
          : `Os pedidos de hoje encerraram às ${contato.horarioPedidos}. Você pode ver o cardápio e voltar amanhã!`}
      </Banner>
    </div>
  );
}
