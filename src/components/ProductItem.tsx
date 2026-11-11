import { Link, useLocation } from "react-router-dom";
import { formatarPreco, type Produto } from "../data/menu";
<<<<<<< HEAD
import { itemDoProduto, registrarEvento } from "../lib/analytics";
=======
>>>>>>> 5fa7d297b0c640f24cbe3bbc959e18c4cf59712c
import { enderecoDoCardapio } from "../lib/navegacao";
import { FotoProduto } from "./FotoProduto";
import { OrderControl } from "./OrderControl";

export function ProductRow({ produto }: { produto: Produto }) {
  return (
    <li className="item">
      <div className={`item__foto${produto.ajuste === "contain" ? " item__foto--contain" : ""}`}>
        <FotoProduto produto={produto} />
      </div>
      <div className="item__corpo">
        <h3 className="item__nome"><ProdutoLink produto={produto} /></h3>
        <p className="item__desc">{produto.descricao}</p>
        <div className="item__rodape">
          <span className="preco">{formatarPreco(produto.preco)}</span>
          <OrderControl produto={produto} />
        </div>
      </div>
    </li>
  );
}

export function ProductCard({ produto }: { produto: Produto }) {
  return (
    <li className="card">
      <div className={`card__foto${produto.ajuste === "contain" ? " card__foto--contain" : ""}`}>
        <FotoProduto produto={produto} />
      </div>
      <div className="card__corpo">
        <h3 className="t-subtitulo"><ProdutoLink produto={produto} /></h3>
        <p className="card__desc">{produto.descricao}</p>
        <div className="card__rodape">
          <span className="preco">{formatarPreco(produto.preco)}</span>
          <OrderControl produto={produto} />
        </div>
      </div>
    </li>
  );
}

/** Nome do produto como link para o Detalhe, lembrando de onde o cliente veio (cardápio da Home: lista, grade, categoria). */
function ProdutoLink({ produto }: { produto: Produto }) {
  const local = useLocation();
  return (
<<<<<<< HEAD
    <Link
      className="produto-link"
      to={`/cardapio/${produto.id}`}
      state={{ voltar: enderecoDoCardapio(local.search) }}
      onClick={() => registrarEvento("select_item", { item_list_id: "cardapio_home", item_list_name: "Cardápio", items: [itemDoProduto(produto)] })}
    >
=======
    <Link className="produto-link" to={`/cardapio/${produto.id}`} state={{ voltar: enderecoDoCardapio(local.search) }}>
>>>>>>> 5fa7d297b0c640f24cbe3bbc959e18c4cf59712c
      {produto.nome}
    </Link>
  );
}
