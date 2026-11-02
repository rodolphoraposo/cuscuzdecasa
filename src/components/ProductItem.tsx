import { Link, useLocation } from "react-router-dom";
import { formatarPreco, type Produto } from "../data/menu";
import { OrderControl } from "./OrderControl";

export function ProductRow({ produto }: { produto: Produto }) {
  return (
    <li className="item">
      <div className={`item__foto${produto.ajuste === "contain" ? " item__foto--contain" : ""}`}>
        <img src={produto.imagem} alt={produto.nome} loading="lazy" />
      </div>
      <div className="item__corpo">
        <h3 className="item__nome"><ProdutoLink produto={produto} /></h3>
        <p className="item__desc">{produto.descricao}</p>
        <div className="item__rodape">
          <span className="preco">{formatarPreco(produto.preco)}</span>
          <OrderControl id={produto.id} nome={produto.nome} />
        </div>
      </div>
    </li>
  );
}

export function ProductCard({ produto }: { produto: Produto }) {
  return (
    <li className="card">
      <div className={`card__foto${produto.ajuste === "contain" ? " card__foto--contain" : ""}`}>
        <img src={produto.imagem} alt={produto.nome} loading="lazy" />
      </div>
      <div className="card__corpo">
        <h3 className="t-subtitulo"><ProdutoLink produto={produto} /></h3>
        <p className="card__desc">{produto.descricao}</p>
        <div className="card__rodape">
          <span className="preco">{formatarPreco(produto.preco)}</span>
          <OrderControl id={produto.id} nome={produto.nome} />
        </div>
      </div>
    </li>
  );
}

/** Nome do produto como link para o Detalhe, lembrando de onde o cliente veio (lista, grade, categoria). */
function ProdutoLink({ produto }: { produto: Produto }) {
  const local = useLocation();
  return (
    <Link className="produto-link" to={`/cardapio/${produto.id}`} state={{ voltar: local.pathname + local.search }}>
      {produto.nome}
    </Link>
  );
}
