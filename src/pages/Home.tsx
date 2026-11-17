import hero from "../assets/home/hero-carne-de-sol-recheio.webp";
import logo from "../assets/logo/logo-full.webp";
import { CartBar } from "../components/CartBar";
import { Cardapio } from "../components/Cardapio";
import { LinkCardapio } from "../components/LinkCardapio";
import { ButtonLink } from "../components/ui";
import { ConsultaTaxa } from "../components/ConsultaTaxa";
import { contato, formatarPreco } from "../data/menu";
import { RAIO_MAXIMO_KM, descreverFaixas } from "../lib/area";

const passos = [
  { titulo: "Escolha no cardápio", texto: "Veja os sabores e monte seu pedido em poucos toques." },
  { titulo: `Finalize até as ${contato.horarioPedidos}`, texto: "Envie a comanda pelo WhatsApp para confirmar." },
  { titulo: "Receba em casa", texto: `Entregamos quentinho, das ${contato.horarioEntrega}.` },
];

export default function Home() {
  return (
    <>
      <section className="container hero-secao">
        <div className="hero">
          <div className="hero__imagem">
            <img src={hero} alt="Cuscuz recheado com carne de sol em prato laranja" />
          </div>
          <div className="hero__texto">
            <span className="badge badge--marca">Entrega num raio de {RAIO_MAXIMO_KM.toLocaleString("pt-BR")} km</span>
            <h1 className="t-display hero__titulo">Cuscuz é sempre uma <span>boa ideia!</span></h1>
            <p className="t-corpo hero__lead">
              Cuscuz recheado, quentinho e preparado com cuidado. Peça pelo cardápio digital e receba em casa.
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
          Entregamos num raio de {RAIO_MAXIMO_KM.toLocaleString("pt-BR")} km. A taxa depende da distância; digite seu CEP e veja. Também aceitamos pedidos para retirada na casa.
        </p>
        <ul className="faixas-entrega">
          {descreverFaixas(formatarPreco).map((f) => <li key={f}>{f}</li>)}
        </ul>
        <ConsultaTaxa />
        <p className="t-corpo">
          Mora mais longe? <a href={`https://wa.me/${contato.whatsapp}`}>Chame no WhatsApp.</a>
        </p>
      </section>

      <section className="section container" id="encomendas">
        <div className="encomenda-chamada">
          <h2 className="t-secao">Encomendas para festas e eventos</h2>
          <p className="t-corpo">Quantidade grande? Conte o que precisa, escolha a data e envie pelo WhatsApp: a gente calcula o valor e combina tudo com você.</p>
          <ButtonLink to="/encomenda" variante="primary">Fazer uma encomenda</ButtonLink>
        </div>
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
