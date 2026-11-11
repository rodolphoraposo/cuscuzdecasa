import hero from "../assets/home/hero-carne-de-sol-recheio.webp";
import logo from "../assets/logo/logo-full.webp";
import { CartBar } from "../components/CartBar";
import { Cardapio } from "../components/Cardapio";
import { LinkCardapio } from "../components/LinkCardapio";
import { Tag } from "../components/ui";
import { condominios, contato } from "../data/menu";

const passos = [
  { titulo: "Escolha no cardápio", texto: "Veja os sabores e monte seu pedido em poucos toques." },
  { titulo: `Finalize até as ${contato.horarioPedidos}`, texto: "Envie a comanda pelo WhatsApp para confirmar." },
  { titulo: "Receba no condomínio", texto: `Entregamos quentinho, das ${contato.horarioEntrega}.` },
];

export default function Home() {
  return (
    <>
      <section className="container hero">
        <div className="hero__texto">
          <span className="badge badge--marca">Entrega nos condomínios da Serraria</span>
          <h1 className="t-display hero__titulo">Cuscuz é sempre uma boa ideia!</h1>
          <p className="t-corpo hero__lead">
            Cuscuz recheado, quentinho e preparado com cuidado. Peça pelo cardápio digital e receba no seu condomínio.
          </p>
          <p className="hero__cta">Faça seu pedido de dia e receba à noite!</p>
          <p className="t-legenda">
            {contato.diasFuncionamento.charAt(0).toUpperCase() + contato.diasFuncionamento.slice(1)} · Pedidos até as {contato.horarioPedidos} · entrega das {contato.horarioEntrega}
          </p>
          <p className="t-legenda">Delivery ou retirada na casa.</p>
          <div className="hero__acoes">
            <LinkCardapio origem="hero_peca_agora" className="btn btn--primary btn--lg">Peça agora!</LinkCardapio>
            <a href="#como-funciona" className="btn btn--soft btn--sm">Como funciona</a>
          </div>
        </div>
        <div className="hero__imagem">
          <img src={hero} alt="Cuscuz recheado com carne de sol em prato laranja" />
        </div>
      </section>

      <Cardapio />

      <section className="section como" id="como-funciona">
        <div className="container">
          <h2 className="t-secao">Como funciona</h2>
          <ol className="passos">
            {passos.map((p, i) => (
              <li className="passo" key={p.titulo}>
                <span className="passo__n" aria-hidden="true">{i + 1}</span>
                <div>
                  <h3 className="t-subtitulo">{p.titulo}</h3>
                  <p>{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section container" id="onde-entregamos">
        <h2 className="t-secao">Onde entregamos</h2>
        <p className="t-corpo" style={{ marginTop: "var(--esp-8)", color: "var(--texto-secundario)" }}>
          Entregamos nos condomínios da Serraria. Também aceitamos pedidos para retirada na casa.
        </p>
        <ul className="chips">
          {condominios.map((c) => (
            <li key={c}><Tag variante="outline">{c}</Tag></li>
          ))}
        </ul>
        <p className="t-corpo">
          Não achou o seu? <a href={`https://wa.me/${contato.whatsapp}`}>Chame no WhatsApp.</a>
        </p>
      </section>

      <section className="section secao-marca">
        <div className="container marca">
          <img src={logo} alt="Cuscuz de Casa" width="600" height="600" loading="lazy" />
          <h2 className="t-secao">Uma marca que começa em casa</h2>
          <p className="t-corpo">Comida preparada com cuidado: quente, farta, próxima e fácil de pedir.</p>
        </div>
      </section>

      <CartBar />
    </>
  );
}
