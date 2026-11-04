import { useEntrega } from "../hooks/useEntrega";
import { contato } from "../data/menu";
import { Banner } from "./ui";

/** Avisa cedo (no cardápio e no pedido) que os pedidos de hoje já encerraram. */
export function AvisoEncerrado() {
  const { dia } = useEntrega();
  if (dia !== null) return null;
  return (
    <div className="aviso-encerrado">
      <Banner tipo="aviso">
        Os pedidos de hoje encerraram às {contato.horarioPedidos}. Você pode ver o cardápio e voltar amanhã!
      </Banner>
    </div>
  );
}
