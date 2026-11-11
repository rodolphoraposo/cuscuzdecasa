import { Minus, Plus } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";
import { chaveDe, useCart } from "../context/CartContext";
import { exigeAcompanhamento, nomeCompleto, type Produto } from "../data/menu";
import { enderecoDoCardapio } from "../lib/navegacao";

/**
 * Salgados exigem escolher acompanhamento: "Pedir" abre o Detalhe do item.
 * Doces e bebidas: "Pedir" adiciona direto e vira um seletor de quantidade.
 */
export function OrderControl({ produto }: { produto: Produto }) {
  const { quantidadeSimples, adicionar, alterar } = useCart();
  const local = useLocation();
  const { id } = produto;
  const nome = nomeCompleto(produto);
  const qtd = quantidadeSimples(id);

  if (exigeAcompanhamento(produto)) {
    return (
      <Link
        className="btn btn--primary btn--sm"
        to={`/cardapio/${id}`}
        state={{ voltar: enderecoDoCardapio(local.search) }}
        aria-label={`Pedir ${nome}`}
      >
        Pedir
      </Link>
    );
  }

  if (qtd === 0) {
    return (
      <button type="button" className="btn btn--primary btn--sm" onClick={() => adicionar(id)} aria-label={`Pedir ${nome}`}>
        Pedir
      </button>
    );
  }

  return (
    <div className="stepper" role="group" aria-label={`Quantidade de ${nome}`}>
      <button type="button" onClick={() => alterar(chaveDe(id, []), -1)} aria-label={`Remover um ${nome}`}>
        <Minus size={16} />
      </button>
      <output aria-live="polite">{qtd}</output>
      <button type="button" onClick={() => adicionar(id)} aria-label={`Adicionar mais um ${nome}`}>
        <Plus size={16} />
      </button>
    </div>
  );
}
