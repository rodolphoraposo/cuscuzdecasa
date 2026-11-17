import { CaretLeft, Minus, Plus, Handbag } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FotoProduto } from "../components/FotoProduto";
import { Button, ButtonLink, Checkbox, EmptyState, Radio } from "../components/ui";
import { MAX_QTD, useCart } from "../context/CartContext";
import { ADICIONAL_INCLUSO, aceitaAdicionais, acompanhamentos, adicionais, exigeAcompanhamento, formatarPreco, produtos, valorDoAdicional, type Produto } from "../data/menu";
import { usePageTitle } from "../hooks/usePageTitle";
import { MOEDA, itemDoProduto, registrarEvento } from "../lib/analytics";
import { enderecoDoCardapio, origemSegura } from "../lib/navegacao";

export default function ProductDetail() {
  const { id } = useParams();
  const produto = produtos.find((p) => p.id === id);
  usePageTitle(produto?.nome ?? "Item não encontrado");

  if (!produto) {
    return (
      <section className="section container">
        <EmptyState
          nivel={1}
          titulo="Item não encontrado"
          texto="Esse item não está mais no cardápio. Veja as opções disponíveis."
          acao={<ButtonLink to={enderecoDoCardapio()}>Ver cardápio</ButtonLink>}
        />
      </section>
    );
  }
  // key: ao trocar de item, quantidade e adicionais voltam ao estado inicial
  return <Detalhe key={produto.id} produto={produto} />;
}

function Detalhe({ produto }: { produto: Produto }) {
  // O cliente abriu o Detalhe do item (uma vez por item aberto).
  useEffect(() => {
    registrarEvento("view_item", { currency: MOEDA, value: produto.preco, items: [itemDoProduto(produto)] });
  }, [produto]);
  const { adicionar } = useCart();
  const navigate = useNavigate();
  const origem = origemSegura(useLocation().state);
  const [qtd, setQtd] = useState(1);
  const [extras, setExtras] = useState<string[]>([]);
  const [acomp, setAcomp] = useState<string | null>(null);
  const [erroAcomp, setErroAcomp] = useState(false);
  const exige = exigeAcompanhamento(produto);

  const opcoes = aceitaAdicionais(produto) ? adicionais : [];
  const unitario = produto.preco + extras.reduce((t, e) => t + (() => { const a = adicionais.find((x) => x.id === e); return a ? valorDoAdicional(a) : 0; })(), 0);
  // "Leve junto": bebidas escolhidas na própria tela (1 de cada), para o cliente não precisar de mais uma etapa.
  const bebidas = produto.categoria === "bebidas" ? [] : produtos.filter((p) => p.categoria === "bebidas");
  const [bebidasSel, setBebidasSel] = useState<string[]>([]);
  const centavosBebidas = bebidasSel.reduce((t, id) => t + Math.round((produtos.find((p) => p.id === id)?.preco ?? 0) * 100), 0);
  const total = (Math.round(unitario * 100) * qtd + centavosBebidas) / 100;
  const padrao = enderecoDoCardapio(produto.prato ? `?prato=${produto.prato}&categoria=${produto.categoria}` : "?prato=bebidas");
  const voltar = origem ?? padrao; // volta para onde o cliente estava (Início, lista ou grade)
  const aposAdicionar = origem?.endsWith("#cardapio") ? origem : padrao; // depois de adicionar, mostra o cardápio com a barra do pedido

  const alternar = (extraId: string) =>
    setExtras((atual) => (atual.includes(extraId) ? atual.filter((e) => e !== extraId) : [...atual, extraId]));

  const alternarBebida = (id: string) =>
    setBebidasSel((atual) => (atual.includes(id) ? atual.filter((b) => b !== id) : [...atual, id]));

  const confirmar = () => {
    if (exige && !acomp) {
      setErroAcomp(true);
      document.querySelector<HTMLElement>('input[name="acompanhamento"]')?.focus();
      return;
    }
    adicionar(produto.id, extras, qtd, acomp);
    for (const id of bebidasSel) adicionar(id, [], 1, null);
    // Sequência do pedido: prato → capriche → bebida → dados. Se o cliente já escolheu bebida aqui, não sugere de novo.
    if (produto.categoria !== "bebidas" && bebidasSel.length === 0) navigate(enderecoDoCardapio("?prato=bebidas"), { state: { sugerirBebida: true } });
    else navigate(aposAdicionar);
  };

  return (
    <div className="detail-pagina">
      <div className={`detail-hero${produto.ajuste === "contain" || produto.categoria === "bebidas" ? " detail-hero--contain" : ""}`}>
        <Link className="icon-btn icon-btn--destaque detail-hero__voltar" to={voltar} aria-label="Voltar ao cardápio">
          <CaretLeft size={20} />
        </Link>
        <FotoProduto produto={produto} lazy={false} />
      </div>

      <div className="detail-folha">
      <div className="container">
        <div className="detail">
          <div className="detail__topo">
            <div className="detail__titulo">
              <h1 className="t-secao">{produto.nome}</h1>
              <p className="preco">{formatarPreco(produto.preco)}</p>
            </div>
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

          {opcoes.length > 0 && ADICIONAL_INCLUSO && (
            <fieldset className="detail__adicionais">
              <legend className="t-subtitulo">Adicional incluso <span className="detail__obrig">(escolha 1 ou nenhum)</span></legend>
              <p className="detail__nota">O valor do adicional já está incluso no preço do prato.</p>
              <div className="acomp">
                <Radio rotulo="Sem adicional" name="adicional" checked={extras.length === 0} onChange={() => setExtras([])} />
              </div>
              {opcoes.map((a) => (
                <div className="acomp" key={a.id}>
                  <Radio rotulo={a.nome} name="adicional" checked={extras[0] === a.id} onChange={() => setExtras([a.id])} />
                </div>
              ))}
            </fieldset>
          )}

          {opcoes.length > 0 && !ADICIONAL_INCLUSO && (
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

          {bebidas.length > 0 && (
            <fieldset className="detail__adicionais">
              <legend className="t-subtitulo">Leve junto <span className="detail__obrig">(opcional)</span></legend>
              {bebidas.map((b) => {
                const campo = `bebida-${b.id}`;
                return (
                  <div className="adicional adicional--foto" key={b.id}>
                    <span className="adicional__foto"><img src={b.imagem} alt="" loading="lazy" /></span>
                    <Checkbox id={campo} rotulo={b.nome} checked={bebidasSel.includes(b.id)} onChange={() => alternarBebida(b.id)} />
                    <label htmlFor={campo}>+ {formatarPreco(b.preco)}</label>
                  </div>
                );
              })}
            </fieldset>
          )}
        </div>
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
    </div>
  );
}
