import { Minus, Plus } from "@phosphor-icons/react";
import { useCart } from "../context/CartContext";

/** Botão "Pedir" que vira um seletor de quantidade depois do primeiro clique. */
export function OrderControl({ id, nome }: { id: string; nome: string }) {
  const { quantidades, adicionar, remover } = useCart();
  const qtd = quantidades[id] ?? 0;

  if (qtd === 0) {
    return (
      <button type="button" className="btn btn--primary btn--sm" onClick={() => adicionar(id)} aria-label={`Pedir ${nome}`}>
        Pedir
      </button>
    );
  }

  return (
    <div className="stepper" role="group" aria-label={`Quantidade de ${nome}`}>
      <button type="button" onClick={() => remover(id)} aria-label={`Remover um ${nome}`}>
        <Minus size={16} />
      </button>
      <output aria-live="polite">{qtd}</output>
      <button type="button" onClick={() => adicionar(id)} aria-label={`Adicionar mais um ${nome}`}>
        <Plus size={16} />
      </button>
    </div>
  );
}
