import { Confetti, ForkKnife, Handbag, House, WhatsappLogo } from "@phosphor-icons/react";
import { useState, type MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { contato, formatarPreco } from "../data/menu";
import { registrarEvento } from "../lib/analytics";
import { linkWhatsAppContato } from "../lib/whatsapp";
import { LinkCardapio } from "./LinkCardapio";

/**
 * Navegação flutuante do celular: Início, Cardápio, Pedido (botão redondo no centro, com a quantidade e o total),
 * Encomendas e WhatsApp. No computador (a partir de 900 px) quem navega é o cabeçalho.
 */
export function NavFlutuante() {
  const { pathname, hash, key } = useLocation();
  const [selecao, setSelecao] = useState<{ key: string; item: "inicio" | "cardapio" }>();
  const { totalItens, totalPreco } = useCart();
  const marcar = (item: string) => () => registrarEvento("clique_nav", { item });
  const itemSelecionado = selecao?.key === key ? selecao.item : undefined;
  const cardapioAtivo = pathname === "/" && (itemSelecionado === "cardapio" || hash === "#cardapio");
  const inicioAtivo = pathname === "/" && !cardapioAtivo;

  // Já no início, "Início" sobe ao topo (o link para a mesma tela não rola sozinho).
  const irAoInicio = (e: MouseEvent<HTMLAnchorElement>) => {
    marcar("inicio")();
    setSelecao({ key, item: "inicio" });
    if (pathname !== "/" || window.location.hash) return;
    e.preventDefault();
    const reduzir = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduzir ? "auto" : "smooth" });
  };

  const rotuloPedido = totalItens === 0 ? "Pedido vazio" : `Pedido: ${totalItens} ${totalItens === 1 ? "item" : "itens"}, ${formatarPreco(totalPreco)}`;

  return (
    <nav className="nav-flutuante" aria-label="Navegação principal">
      <Link to="/" onClick={irAoInicio} aria-current={inicioAtivo ? "page" : undefined}>
        <House size={24} weight={inicioAtivo ? "fill" : "regular"} aria-hidden="true" />
        <span>Início</span>
      </Link>
      <LinkCardapio origem="nav_flutuante" onClick={() => setSelecao({ key, item: "cardapio" })} aria-current={cardapioAtivo ? "page" : undefined}>
        <ForkKnife size={24} weight={cardapioAtivo ? "fill" : "regular"} aria-hidden="true" />
        <span>Cardápio</span>
      </LinkCardapio>
      <Link className="nav-flutuante__pedido" to="/pedido" aria-label={rotuloPedido} onClick={marcar("pedido")}>
        <Handbag size={30} weight="fill" aria-hidden="true" />
        {totalItens > 0 && <span className="nav-flutuante__qtd" aria-hidden="true">{totalItens}</span>}
        {totalItens > 0 && <span className="nav-flutuante__total" aria-hidden="true">{formatarPreco(totalPreco)}</span>}
      </Link>
      <Link to="/encomenda" onClick={marcar("encomendas")} aria-current={pathname === "/encomenda" ? "page" : undefined}>
        <Confetti size={24} weight={pathname === "/encomenda" ? "fill" : "regular"} aria-hidden="true" />
        <span>Encomendas</span>
      </Link>
      <a href={linkWhatsAppContato(contato.whatsapp)} target="_blank" rel="noopener noreferrer" onClick={marcar("whatsapp")}>
        <WhatsappLogo size={24} aria-hidden="true" />
        <span>WhatsApp<span className="sr-only"> (abre em outra aba)</span></span>
      </a>
    </nav>
  );
}
