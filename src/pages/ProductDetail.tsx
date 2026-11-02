import { CaretLeft, Minus, Plus, ShoppingBag } from "@phosphor-icons/react";
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
      <div className={`detail-hero${produto.ajuste === "contain" ? " detail-hero--contain" : ""}`}>
        <Link className="icon-btn icon-btn--destaque detail-hero__voltar" to={voltar} aria-label="Voltar ao cardápio">
          <CaretLeft size={20} />
        </Link>
        <img src={produto.imagem} alt={produto.nome} />
      </div>

      <div className="container">
        <div className="detail">
          <div className="detail__topo">
            <h1 className="t-secao">{produto.nome}</h1>
            <p className="preco">{formatarPreco(produto.preco)}</p>
            <p className="detail__desc">{produto.descricao}</p>
          </div>

          {opcoes.length > 0 && (
            <fieldset className="detail__adicionais">
              <legend className="t-subtitulo">Adicionais</legend>
              {opcoes.map((a) => {
                const campo = `extra-${a.id}`;
                return (
                  <div className="adicional" key={a.id}>
                    <Checkbox id={campo} rotulo={a.nome} checked={extras.includes(a.id)} onChange={() => alternar(a.id)} />
                    <label htmlFor={campo}>+ {formatarPreco(a.preco)}</label>
                  </div>
                );
              })}
            </fieldset>
          )}
        </div>
      </div>

      <div className="detail-bar">
        <div className="container detail-bar__inner">
          <div className="stepper" role="group" aria-label="Quantidade">
            <button type="button" disabled={qtd <= 1} onClick={() => setQtd((q) => q - 1)} aria-label="Diminuir quantidade">
              <Minus size={16} />
            </button>
            <output aria-live="polite">{qtd}</output>
            <button type="button" disabled={qtd >= MAX_QTD} onClick={() => setQtd((q) => q + 1)} aria-label="Aumentar quantidade">
              <Plus size={16} />
            </button>
          </div>
          <Button tamanho="lg" className="detail-bar__btn" onClick={confirmar}>
            <ShoppingBag className="icon" aria-hidden="true" />
            Adicionar · {formatarPreco(total)}
          </Button>
        </div>
      </div>
    </>
  );
}
