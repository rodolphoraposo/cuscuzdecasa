import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatarPreco } from "../data/menu";

export function CartBar() {
  const { totalItens, totalPreco } = useCart();
  if (totalItens === 0) return null;

  return (
    <div className="cartbar">
      <div className="container">
        <Link className="btn btn--primary btn--lg btn--block" to="/pedido">
          Ver pedido · {totalItens} {totalItens === 1 ? "item" : "itens"} · {formatarPreco(totalPreco)}
        </Link>
      </div>
    </div>
  );
}
