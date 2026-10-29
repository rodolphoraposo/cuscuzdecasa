import { ArrowUUpLeft, ListDashes, SquaresFour } from "@phosphor-icons/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CartBar } from "../components/CartBar";
import { ProductCard, ProductRow } from "../components/ProductItem";
import { categorias, produtos, type CategoriaId } from "../data/menu";

type Vista = "lista" | "grade";

export default function Menu() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const categoria = (categorias.find((c) => c.id === params.get("categoria"))?.id ?? "salgados") as CategoriaId;
  const vista: Vista = params.get("vista") === "grade" ? "grade" : "lista";
  const itens = produtos.filter((p) => p.categoria === categoria);

  const atualizar = (chave: string, valor: string) => {
    const next = new URLSearchParams(params);
    next.set(chave, valor);
    setParams(next, { replace: true });
  };

  return (
    <>
      <div className="container">
        <div className="page-header">
          <button type="button" className="icon-btn icon-btn--destaque" aria-label="Voltar" onClick={() => navigate(-1)}>
            <ArrowUUpLeft size={20} />
          </button>
          <h1 className="t-subtitulo">Cardápio</h1>
        </div>

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

        <div className="toolbar">
          <h2>{itens.length} {itens.length === 1 ? "Sabor" : "Sabores"}</h2>
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
