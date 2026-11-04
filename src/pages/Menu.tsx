import { CaretLeft, ListDashes, SquaresFour } from "@phosphor-icons/react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { AvisoEncerrado } from "../components/AvisoEncerrado";
import { CartBar } from "../components/CartBar";
import { Banner, ButtonLink } from "../components/ui";
import { ProductCard, ProductRow } from "../components/ProductItem";
import { categorias, pratos, produtos, type CategoriaId, type PratoId } from "../data/menu";

type Vista = "lista" | "grade";

export default function Menu() {
  const [params, setParams] = useSearchParams();

  const categoria = (categorias.find((c) => c.id === params.get("categoria"))?.id ?? "salgados") as CategoriaId;
  const prato = (pratos.find((x) => x.id === params.get("prato"))?.id ?? "cuscuz") as PratoId;
  const vista: Vista = params.get("vista") === "grade" ? "grade" : "lista";
  // Depois de adicionar um prato, o Detalhe leva às bebidas com este aviso (some ao trocar de aba).
  const sugerirBebida = (useLocation().state as { sugerirBebida?: boolean } | null)?.sugerirBebida === true && categoria === "bebidas";
  // Bebidas valem para qualquer prato; salgados e doces dependem do prato escolhido (cuscuz ou macaxeira).
  const itens = produtos.filter((p) => p.categoria === categoria && (categoria === "bebidas" || p.prato === prato));

  const atualizar = (chave: string, valor: string) => {
    const next = new URLSearchParams(params);
    next.set(chave, valor);
    setParams(next, { replace: true });
  };

  return (
    <>
      <div className="container">
        <div className="page-header">
          <Link className="icon-btn icon-btn--destaque" to="/" aria-label="Voltar ao início">
            <CaretLeft size={20} />
          </Link>
          <h1 className="t-subtitulo">Cardápio</h1>
        </div>

        <AvisoEncerrado />

        {categoria !== "bebidas" && (
          <div className="pratos" role="group" aria-label="Escolha o prato">
            {pratos.map((x) => (
              <button key={x.id} type="button" className="prato-btn" aria-pressed={x.id === prato} onClick={() => atualizar("prato", x.id)}>
                {x.nome}
              </button>
            ))}
          </div>
        )}

        <div className="tabs" role="tablist" aria-label="Categorias do cardápio">
          {categorias.map((c) => (
            <button
              key={c.id}
              role="tab"
              id={`aba-${c.id}`}
              aria-selected={c.id === categoria}
              aria-controls="painel-cardapio"
              type="button"
              onClick={() => atualizar("categoria", c.id)}
            >
              {c.nome}
            </button>
          ))}
        </div>

        {sugerirBebida && (
          <div className="sugestao">
            <Banner tipo="sucesso">Prato adicionado! Quer uma bebida para acompanhar?</Banner>
            <ButtonLink to="/pedido" variante="outline" bloco>Não quero bebida · Ver pedido</ButtonLink>
          </div>
        )}

        <div className="toolbar">
          <h2>{itens.length} {itens.length === 1 ? "Opção" : "Opções"}</h2>
          <div className="toolbar__vistas" role="group" aria-label="Modo de exibição">
            <button type="button" className="icon-btn" aria-pressed={vista === "lista"} aria-label="Ver em lista" onClick={() => atualizar("vista", "lista")}>
              <ListDashes size={24} />
            </button>
            <button type="button" className="icon-btn" aria-pressed={vista === "grade"} aria-label="Ver em grade" onClick={() => atualizar("vista", "grade")}>
              <SquaresFour size={24} />
            </button>
          </div>
        </div>

        <div role="tabpanel" id="painel-cardapio" aria-labelledby={`aba-${categoria}`} style={{ minHeight: "40vh" }}>
          {vista === "lista" ? (
            <ul className="lista">
              {itens.map((p) => <ProductRow key={p.id} produto={p} />)}
            </ul>
          ) : (
            <ul className="cards">
              {itens.map((p) => <ProductCard key={p.id} produto={p} />)}
            </ul>
          )}
        </div>
      </div>

      <CartBar />
    </>
  );
}
