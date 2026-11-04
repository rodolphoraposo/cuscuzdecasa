import { CaretLeft, Minus, Plus, Handbag } from "@phosphor-icons/react";
import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FotoProduto } from "../components/FotoProduto";
import { Button, ButtonLink, Checkbox, EmptyState, Radio } from "../components/ui";
import { MAX_QTD, useCart } from "../context/CartContext";
import { aceitaAdicionais, acompanhamentos, adicionais, exigeAcompanhamento, formatarPreco, produtos, type Produto } from "../data/menu";
import { usePageTitle } from "../hooks/usePageTitle";
import { origemSegura } from "../lib/navegacao";

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
  const origem = origemSegura(useLocation().state);
  const [qtd, setQtd] = useState(1);
  const [extras, setExtras] = useState<string[]>([]);
  const [acomp, setAcomp] = useState<string | null>(null);
  const [erroAcomp, setErroAcomp] = useState(false);
  const exige = exigeAcompanhamento(produto);

  const opcoes = aceitaAdicionais(produto) ? adicionais : [];
  const unitario = produto.preco + extras.reduce((t, e) => t + (adicionais.find((a) => a.id === e)?.preco ?? 0), 0);
  const total = Math.round(unitario * 100) * qtd / 100;
  const padrao = `/cardapio?prato=${produto.prato ?? "cuscuz"}&categoria=${produto.categoria}`;
  const voltar = origem ?? padrao; // volta para onde o cliente estava (Início, lista ou grade)
  const aposAdicionar = origem?.startsWith("/cardapio") ? origem : padrao; // depois de adicionar, mostra o cardápio com a barra do pedido

  const alternar = (extraId: string) =>
    setExtras((atual) => (atual.includes(extraId) ? atual.filter((e) => e !== extraId) : [...atual, extraId]));

  const confirmar = () => {
    if (exige && !acomp) {
      setErroAcomp(true);
      document.querySelector<HTMLElement>('input[name="acompanhamento"]')?.focus();
      return;
    }
    adicionar(produto.id, extras, qtd, acomp);
    // Sequência do pedido: prato → capriche → bebida → dados. Depois de um prato, sugere a bebida.
    if (produto.categoria !== "bebidas") navigate("/cardapio?categoria=bebidas", { state: { sugerirBebida: true } });
    else navigate(aposAdicionar);
  };

  return (
    <>
      <div className={`detail-hero${produto.ajuste === "contain" ? " detail-hero--contain" : ""}`}>
        <Link className="icon-btn icon-btn--destaque detail-hero__voltar" to={voltar} aria-label="Voltar ao cardápio">
          <CaretLeft size={20} />
        </Link>
        <FotoProduto produto={produto} lazy={false} />
      </div>

      <div className="container">
        <div className="detail">
          <div className="detail__topo">
            <h1 className="t-secao">{produto.nome}</h1>
            <p className="preco">{formatarPreco(produto.preco)}</p>
            <p className="detail__desc">{produto.descricaoLonga ?? produto.descricao}</p>
            {produto.dica && <p className="detail__dica"><strong>Dica da casa:</strong> {produto.dica}</p>}
          </div>

          {exige && (
            <fieldset className="detail__adicionais" aria-describedby={erroAcomp ? "erro-acomp" : undefined}>
              <legend className="t-subtitulo">Acompanhamento <span className="detail__obrig">(escolha 1)</span></legend>
              {acompanhamentos.map((a) => (
                <div className="acomp" key={a.id}>
                  <Radio
                    name="acompanhamento" rotulo={a.nome} checked={acomp === a.id} erro={erroAcomp}
                    aria-describedby={a.descricao ? `desc-${a.id}` : undefined}
                    onChange={() => { setAcomp(a.id); setErroAcomp(false); }}
                  />
                  {a.descricao && <p className="acomp__desc" id={`desc-${a.id}`}>{a.descricao}</p>}
                </div>
              ))}
              {erroAcomp && <p className="erro-msg" id="erro-acomp" role="alert">Escolha o acompanhamento para continuar.</p>}
            </fieldset>
          )}

          {opcoes.length > 0 && (
            <fieldset className="detail__adicionais">
              <legend className="t-subtitulo">Capriche seu prato <span className="detail__obrig">(opcional)</span></legend>
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
            <Handbag className="icon" aria-hidden="true" />
            Adicionar · {formatarPreco(total)}
          </Button>
        </div>
      </div>
    </>
  );
}
