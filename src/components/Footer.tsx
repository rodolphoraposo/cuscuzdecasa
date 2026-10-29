import { Link } from "react-router-dom";
import logo from "../assets/img/logo-full.png";
import { contato } from "../data/menu";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div style={{ display: "grid", gap: "var(--esp-16)", justifyItems: "start" }}>
            <img className="footer__logo" src={logo} alt="Cuscuz de Casa" />
            <p className="footer__slogan">Cuscuz é sempre uma boa ideia!</p>
          </div>

          <nav aria-label="Rodapé">
            <Link to="/cardapio">Cardápio</Link>
            <a href="/#como-funciona">Como funciona</a>
            <a href="/#onde-entregamos">Onde entregamos</a>
            <Link to="/privacidade">Política de Privacidade</Link>
            <Link to="/termos">Termos de Uso</Link>
          </nav>

          <p>
            <a href={`https://wa.me/${contato.whatsapp}`}>{contato.telefoneExibicao}</a>
          </p>
        </div>
        <p className="footer__copy t-legenda">© {new Date().getFullYear()} Cuscuz de Casa · Maceió, AL</p>
      </div>
    </footer>
  );
}
