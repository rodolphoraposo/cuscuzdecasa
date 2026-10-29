import { Moon, Sun } from "@phosphor-icons/react";
import { Link, NavLink } from "react-router-dom";
import icone from "../assets/img/logo-icon.png";
import wordmark from "../assets/img/wordmark.png";
import { useTheme } from "../context/useTheme";

export function Header() {
  const { tema, definir } = useTheme();

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__brand" aria-label="Cuscuz de Casa — página inicial">
          <img src={icone} alt="" width="40" height="40" />
          <img src={wordmark} alt="" height="36" />
        </Link>

        <nav className="header__nav t-corpo" aria-label="Principal">
          <NavLink to="/" end>Início</NavLink>
          <NavLink to="/cardapio">Cardápio</NavLink>
          <a href="/#como-funciona">Como funciona</a>
          <a href="/#onde-entregamos">Onde entregamos</a>
        </nav>

        <div className="header__actions">
          <Link to="/cardapio" className="btn btn--primary btn--md header__cta">Peça agora!</Link>
          <button type="button" className="icon-btn" aria-pressed={tema === "light"} aria-label="Tema claro" onClick={() => definir("light")}>
            <Sun size={24} />
          </button>
          <button type="button" className="icon-btn" aria-pressed={tema === "dark"} aria-label="Tema escuro" onClick={() => definir("dark")}>
            <Moon size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
