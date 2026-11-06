import { CaretLeft, ListDashes, SquaresFour } from "@phosphor-icons/react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import type { KeyboardEvent } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import { AvisoEncerrado } from "../components/AvisoEncerrado";
import { CartBar } from "../components/CartBar";
import { Banner, ButtonLink } from "../components/ui";
import { ProductCard, ProductRow } from "../components/ProductItem";
import { abas, produtos, secoes, type AbaId, type SecaoId } from "../data/menu";

type Vista = "lista" | "grade";

export default function Menu() {
  const [params, setParams] = useSearchParams();

  // Endereço: ?prato=cuscuz|macaxeira|bebidas &categoria=todos|salgados|doces &vista=lista|grade
  // ("?categoria=bebidas" é o formato antigo do link e continua levando às bebidas).
  const secao = (params.get("categoria") === "bebidas" ? "bebidas" : (secoes.find((s) => s.id === params.get("prato"))?.id ?? "cuscuz")) as SecaoId;
  const aba = (abas.find((x) => x.id === params.get("categoria"))?.id ?? "todos") as AbaId;
  const comAbas = secao !== "bebidas";
  const vista: Vista = params.get("vista") === "grade" ? "grade" : "lista";
  // Depois de adicionar um prato, o Detalhe leva às bebidas com este aviso (some ao trocar de seção).
  const sugerirBebida = (useLocation().state as { sugerirBebida?: boolean } | null)?.sugerirBebida === true && secao === "bebidas";
  usePageTitle("Cardápio");

  // Setas, Home e End trocam de aba (padrão de abas do teclado); só a aba atual entra na ordem do Tab.
  const aoTeclarNasAbas = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = abas.findIndex((x) => x.id === aba);
    const n = abas.length;
    const j = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (j < 0) return;
    e.preventDefault();
    atualizar("categoria", abas[j].id);
    window.setTimeout(() => document.getElementById(`aba-${abas[j].id}`)?.focus(), 0);
  };

  // Bebidas: todas, sem abas. Cuscuz e Macaxeira: filtram pelo prato e pela aba (Todos = salgados e doces).
  const itens = secao === "bebidas"
    ? produtos.filter((p) => p.categoria === "bebidas")
    : produtos.filter((p) => p.prato === secao && (aba === "todos" || p.categoria === aba));

  const atualizar = (chave: string, valor: string) => {
    const next = new URLSearchParams(params);
    next.set(chave, valor);
    if (chave === "prato" && valor === "bebidas") next.delete("categoria"); // bebidas não usam abas
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

        <div className="pratos" role="group" aria-label="Escolha o que pedir">
          {secoes.map((s) => (
            <button key={s.id} type="button" className="prato-btn" aria-pressed={s.id === secao} onClick={() => atualizar("prato", s.id)}>
              {s.nome}
            </button>
          ))}
        </div>

        {comAbas && (
          <div className="tabs" role="tablist" aria-label="Categorias do cardápio" onKeyDown={aoTeclarNasAbas}>
            {abas.map((x) => (
              <button
                key={x.id}
                role="tab"
                id={`aba-${x.id}`}
                aria-selected={x.id === aba}
                tabIndex={x.id === aba ? 0 : -1}
                aria-controls="painel-cardapio"
                type="button"
                onClick={() => atualizar("categoria", x.id)}
              >
                {x.nome}
              </button>
            ))}
          </div>
        )}

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

        <div role={comAbas ? "tabpanel" : "region"} id="painel-cardapio" aria-labelledby={comAbas ? `aba-${aba}` : undefined} aria-label={comAbas ? undefined : "Bebidas"} style={{ minHeight: "40vh" }}>
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
