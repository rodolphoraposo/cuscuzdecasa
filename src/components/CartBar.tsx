import { useCart } from "../context/CartContext";
import { formatarPreco } from "../data/menu";

export function CartBar() {
  const { totalItens, totalPreco, linkWhatsApp } = useCart();
  if (totalItens === 0) return null;

  return (
    <div className="cartbar">
      <div className="container">
        <a className="btn btn--primary btn--lg btn--block" href={linkWhatsApp()} target="_blank" rel="noopener noreferrer">
          Ver pedido · {totalItens} {totalItens === 1 ? "item" : "itens"} · {formatarPreco(totalPreco)}
        </a>
      </div>
    </div>
  );
}
