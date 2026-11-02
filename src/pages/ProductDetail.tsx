import { CaretLeft, Minus, Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, ButtonLink, Checkbox, EmptyState } from "../components/ui";
import { MAX_QTD, useCart } from "../context/CartContext";
import { aceitaAdicionais, adicionais, formatarPreco, produtos, type Produto } from "../data/menu";
import { usePageTitle } from "../hooks/usePageTitle";

export default function ProductDetail() {
  const { id } = useParams();
  const produto = produtos.find((p) => p.id === id);
  usePageTitle(produto?.nome ?? "Item não encontrado");

  if (!produto) {
    return (
      <section className="section container">
        <EmptyState
          titulo="Item não encontrado"
          texto="Esse item não está mais no cardápio. Veja as opções disponíveis."
          acao={<ButtonLink to="/cardapio">Ver cardápio</ButtonLink>}
        />
      </section>
    );
  }
  // key: ao trocar de item, quantidade e adicionais voltam ao estado inicial
  return <Detalhe key={produto.id} produto={produto} />;
}

function Detalhe({ produto }: { produto: Produto }) {
  const { adicionar } = useCart();
  const navigate = useNavigate();
  const [qtd, setQtd] = useState(1);
  const [extras, setExtras] = useState<string[]>([]);

  const opcoes = aceitaAdicionais(produto) ? adicionais : [];
  const unitario = produto.preco + extras.reduce((t, e) => t + (adicionais.find((a) => a.id === e)?.preco ?? 0), 0);
  const total = Math.round(unitario * 100) * qtd / 100;
  const voltar = `/cardapio?categoria=${produto.categoria}`;

  const alternar = (extraId: string) =>
    setExtras((atual) => (atual.includes(extraId) ? atual.filter((e) => e !== extraId) : [...atual, extraId]));

  const confirmar = () => {
    adicionar(produto.id, extras, qtd);
    navigate(voltar);
  };

  return (
    <>
      <div className="container">
        <div className="page-header">
          <Link className="icon-btn icon-btn--destaque" to={voltar} aria-label="Voltar ao cardápio">
            <CaretLeft size={20} />
          </Link>
        </div>

        <div className="detail">
          <div className={`detail__foto${produto.ajuste === "contain" ? " detail__foto--contain" : ""}`}>
            <img src={produto.imagem} alt={produto.nome} />
          </div>

          <div className="detail__topo">
            <h1 className="t-pagina">{produto.nome}</h1>
            <p className="preco">{formatarPreco(produto.preco)}</p>
            <p className="t-corpo detail__desc">{produto.descricao}</p>
          </div>

          {opcoes.length > 0 && (
            <fieldset className="detail__adicionais">
              <legend className="t-subtitulo">Adicionais</legend>
              {opcoes.map((a) => (
                <Checkbox
                  key={a.id}
                  rotulo={`${a.nome} · + ${formatarPreco(a.preco)}`}
                  checked={extras.includes(a.id)}
                  onChange={() => alternar(a.id)}
                />
              ))}
            </fieldset>
          )}

          <div className="detail__qtd">
            <span className="t-rotulo" id="rotulo-qtd">Quantidade</span>
            <div className="stepper" role="group" aria-labelledby="rotulo-qtd">
              <button type="button" disabled={qtd <= 1} onClick={() => setQtd((q) => q - 1)} aria-label="Diminuir quantidade">
                <Minus size={16} />
              </button>
              <output aria-live="polite">{qtd}</output>
              <button type="button" disabled={qtd >= MAX_QTD} onClick={() => setQtd((q) => q + 1)} aria-label="Aumentar quantidade">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="cartbar">
        <div className="container">
          <Button tamanho="lg" bloco onClick={confirmar}>
            <Plus className="icon" aria-hidden="true" />
            Adicionar ao pedido · {formatarPreco(total)}
          </Button>
        </div>
      </div>
    </>
  );
}
