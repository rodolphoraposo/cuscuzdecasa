import { InstagramLogo } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { LinkCardapio } from "./LinkCardapio";
import { contato } from "../data/menu";
import logoCreme from "../assets/logo/logo-creme.webp";
import logoMarrom from "../assets/logo/logo-marrom.webp";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div style={{ display: "grid", gap: "var(--esp-16)", justifyItems: "start" }}>
            <img className="footer__logo footer__logo--creme" width="88" height="114" src={logoCreme} alt="Cuscuz de Casa" />
            <img className="footer__logo footer__logo--marrom" width="88" height="114" src={logoMarrom} alt="Cuscuz de Casa" />
            <p className="footer__slogan">Cuscuz é sempre uma boa ideia!</p>
          </div>

          <nav aria-label="Rodapé">
<<<<<<< HEAD
            <LinkCardapio origem="rodape">Cardápio</LinkCardapio>
=======
            <LinkCardapio>Cardápio</LinkCardapio>
>>>>>>> 5fa7d297b0c640f24cbe3bbc959e18c4cf59712c
            <a href="/#como-funciona">Como funciona</a>
            <a href="/#onde-entregamos">Onde entregamos</a>
            <Link to="/privacidade">Política de Privacidade</Link>
            <Link to="/termos">Termos de Uso</Link>
          </nav>

          <div className="footer__contato">
            <p>Funcionamos de {contato.diasFuncionamento}</p>
            <a href={`https://wa.me/${contato.whatsapp}`}>{contato.telefoneExibicao}</a>
            <a
              href={`https://www.instagram.com/${contato.instagram}/`} target="_blank" rel="noopener noreferrer"
              aria-label={`@${contato.instagram} no Instagram (abre em nova aba)`}
            >
              <InstagramLogo size={20} aria-hidden="true" />
              @{contato.instagram}
            </a>
          </div>
        </div>
        <p className="footer__copy t-legenda">© {new Date().getFullYear()} Cuscuz de Casa · Maceió, AL</p>
      </div>
    </footer>
  );
}
