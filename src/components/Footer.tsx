import { InstagramLogo, WhatsappLogo } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { LinkCardapio } from "./LinkCardapio";
import { contato } from "../data/menu";
import { enderecoDoCardapio } from "../lib/navegacao";
import { linkWhatsAppContato } from "../lib/whatsapp";
import logoCreme from "../assets/logo/logo-creme.webp";
import logoMarrom from "../assets/logo/logo-marrom.webp";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__marca">
          <img className="footer__logo footer__logo--creme" width="88" height="114" src={logoCreme} alt="Cuscuz de Casa" />
          <img className="footer__logo footer__logo--marrom" width="88" height="114" src={logoMarrom} alt="Cuscuz de Casa" />
          <p className="footer__slogan">Cuscuz é sempre uma boa ideia!</p>
          <p className="footer__horario">Funcionamos de {contato.diasFuncionamento}</p>
        </div>

        <nav className="footer__colunas" aria-label="Rodapé">
          <div>
            <h2 className="footer__titulo">Navegue</h2>
            <ul>
              <li><LinkCardapio origem="rodape">Cardápio</LinkCardapio></li>
              <li><Link to={enderecoDoCardapio("?prato=combos")}>Combos</Link></li>
              <li><Link to="/encomenda">Encomendas</Link></li>
              <li><a href="/#como-funciona">Como funciona</a></li>
              <li><a href="/#onde-entregamos">Onde entregamos</a></li>
            </ul>
          </div>
          <div>
            <h2 className="footer__titulo">Fale com a gente</h2>
            <ul>
              <li>
                <a href={linkWhatsAppContato(contato.whatsapp)} target="_blank" rel="noopener noreferrer">
                  <WhatsappLogo size={20} aria-hidden="true" />
                  {contato.telefoneExibicao}
                </a>
              </li>
              <li>
                <a
                  href={`https://www.instagram.com/${contato.instagram}/`} target="_blank" rel="noopener noreferrer"
                  aria-label={`@${contato.instagram} no Instagram (abre em nova aba)`}
                >
                  <InstagramLogo size={20} aria-hidden="true" />
                  @{contato.instagram}
                </a>
              </li>
              <li><Link to="/privacidade">Política de Privacidade</Link></li>
              <li><Link to="/termos">Termos de Uso</Link></li>
            </ul>
          </div>
        </nav>

        <p className="footer__copy t-legenda">© {new Date().getFullYear()} Cuscuz de Casa · Maceió, AL</p>
      </div>
    </footer>
  );
}
