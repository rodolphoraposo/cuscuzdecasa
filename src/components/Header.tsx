import { Handbag, List, Moon, Sun, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import icone from "../assets/logo/logo-icon.webp";
import wordmark from "../assets/logo/wordmark.webp";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/useTheme";

export function Header() {
  const { tema, definir } = useTheme();
  const { totalItens } = useCart();
  const [aberto, setAberto] = useState(false);
  const local = useLocation();
  const botaoMenu = useRef<HTMLButtonElement>(null);

  // O menu do celular fecha ao navegar e com a tecla Esc.
  useEffect(() => { setAberto(false); }, [local.pathname, local.hash]);
  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setAberto(false);
      botaoMenu.current?.focus(); // o foco volta para o botão, em vez de se perder
    };
    document.addEventListener("keydown", fechar);
    return () => document.removeEventListener("keydown", fechar);
  }, [aberto]);

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__brand" aria-label="Cuscuz de Casa — página inicial">
          <img src={icone} alt="" width="40" height="40" />
          <img src={wordmark} alt="" width="74" height="36" />
        </Link>

        <nav className="header__nav t-corpo" aria-label="Principal">
          <NavLink to="/" end>Início</NavLink>
          <NavLink to="/cardapio">Cardápio</NavLink>
          <a href="/#como-funciona">Como funciona</a>
          <a href="/#onde-entregamos">Onde entregamos</a>
        </nav>

        <div className="header__actions">
          <Link to="/cardapio" className="btn btn--primary btn--md header__cta">Peça agora!</Link>
          {totalItens > 0 && (
            <Link to="/pedido" className="icon-btn header__sacola" aria-label={`Ver pedido, ${totalItens} ${totalItens === 1 ? "item" : "itens"}`}>
              <Handbag size={24} />
              <span className="header__badge" aria-hidden="true">{totalItens}</span>
            </Link>
          )}
          <button type="button" className="icon-btn" aria-pressed={tema === "light"} aria-label="Tema claro" onClick={() => definir("light")}>
            <Sun size={24} />
          </button>
          <button type="button" className="icon-btn" aria-pressed={tema === "dark"} aria-label="Tema escuro" onClick={() => definir("dark")}>
            <Moon size={24} />
          </button>
          <button
            ref={botaoMenu} type="button" className="icon-btn header__menu" aria-expanded={aberto} aria-controls="menu-mobile"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"} onClick={() => setAberto((a) => !a)}
          >
            {aberto ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>

      <nav id="menu-mobile" className="header__painel" aria-label="Menu" hidden={!aberto}>
        <div className="container">
          <Link to="/">Início</Link>
          <Link to="/cardapio">Cardápio</Link>
          <Link to="/#como-funciona">Como funciona</Link>
          <Link to="/#onde-entregamos">Onde entregamos</Link>
          <Link to="/termos" className="header__painel-sec">Termos de Uso</Link>
          <Link to="/privacidade" className="header__painel-sec">Política de Privacidade</Link>
        </div>
      </nav>
    </header>
  );
}
