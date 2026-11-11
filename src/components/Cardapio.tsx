import { ListDashes, SquaresFour } from "@phosphor-icons/react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AvisoEncerrado } from "./AvisoEncerrado";
import { Banner, ButtonLink } from "./ui";
import { ProductCard, ProductRow } from "./ProductItem";
import { abas, produtos, secoes, type AbaId, type SecaoId } from "../data/menu";
import { itemDoProduto, registrarEvento } from "../lib/analytics";

type Vista = "lista" | "grade";

/**
 * Cardápio completo, direto na Home (#cardapio).
 * Estado no endereço: /?prato=cuscuz|macaxeira|bebidas &categoria=todos|salgados|doces &vista=lista|grade#cardapio
 * ("?categoria=bebidas" é o formato antigo do link e continua levando às bebidas).
 */
export function Cardapio() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const local = useLocation();

  const secao = (params.get("categoria") === "bebidas" ? "bebidas" : (secoes.find((s) => s.id === params.get("prato"))?.id ?? "cuscuz")) as SecaoId;
  const aba = (abas.find((x) => x.id === params.get("categoria"))?.id ?? "todos") as AbaId;
  const comAbas = secao !== "bebidas";
  const vista: Vista = params.get("vista") === "grade" ? "grade" : "lista";
  // Depois de adicionar um prato, o Detalhe leva às bebidas com este aviso (some ao trocar de seção).
  const sugerirBebida = (local.state as { sugerirBebida?: boolean } | null)?.sugerirBebida === true && secao === "bebidas";

  // Troca prato, aba ou vista sem criar histórico e sem perder a âncora: o hash fica, então a tela não pula.
  const atualizar = (chave: string, valor: string) => {
    const next = new URLSearchParams(params);
    next.set(chave, valor);
    if (chave === "prato" && valor === "bebidas") next.delete("categoria"); // bebidas não usam abas
    navigate({ pathname: local.pathname, search: next.toString(), hash: local.hash }, { replace: true });
  };

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

  // Analytics: "view_item_list" quando o cardápio aparece na tela e a cada nova lista vista (prato/aba) depois disso.
  const secaoRef = useRef<HTMLElement>(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = secaoRef.current;
    if (!el || visto || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisto(true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [visto]);
  const idDaLista = comAbas ? `${secao}_${aba}` : secao;
  useEffect(() => {
    if (!visto) return;
    const nomeDaLista = `${secoes.find((s) => s.id === secao)?.nome ?? secao}${comAbas ? ` · ${abas.find((x) => x.id === aba)?.nome ?? aba}` : ""}`;
    registrarEvento("view_item_list", { item_list_id: idDaLista, item_list_name: nomeDaLista, items: itens.map((p) => itemDoProduto(p)) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visto, idDaLista]);

  return (
    <section className="section cardapio" id="cardapio" aria-labelledby="cardapio-titulo" ref={secaoRef}>
      <div className="container">
        <h2 className="t-secao" id="cardapio-titulo" tabIndex={-1}>Cardápio</h2>

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
          <h3>{itens.length} {itens.length === 1 ? "Opção" : "Opções"}</h3>
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
    </section>
  );
}
