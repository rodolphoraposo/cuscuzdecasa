import { Check } from "@phosphor-icons/react";
import { useMemo } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { PreviaComanda } from "../components/PreviaComanda";
import { ButtonLink } from "../components/ui";
import { useCart } from "../context/CartContext";
import { adicionais, contato, taxaEntrega } from "../data/menu";
import { linkWhatsApp, montarComanda } from "../lib/comanda";
import { descricaoEntrega, diaDaEntrega } from "../lib/entrega";
import { carregarRascunho, paraDadosPedido, validarPedido } from "../lib/formulario";
import { salvarUltimoPedido } from "../lib/ultimoPedido";
import { usePageTitle } from "../hooks/usePageTitle";
import { useNoIndex } from "../hooks/useNoIndex";

export default function Finalizar() {
  usePageTitle("Finalizar pedido");
  useNoIndex();
  const navigate = useNavigate();
  const { linhas, totalPreco, limpar } = useCart();
  const rascunho = useMemo(carregarRascunho, []);
  const taxa = rascunho.tipo === "retirada" ? 0 : taxaEntrega;
  const total = Math.round((totalPreco + taxa) * 100) / 100;
  const agora = useMemo(() => new Date(), []);
  const dia = diaDaEntrega(agora);
  const entregaDesc = dia ? descricaoEntrega(rascunho.horario, dia) : "";

  // O código do pedido (data e hora) é gerado uma vez, ao abrir esta tela.
  const comanda = useMemo(() => {
    if (linhas.length === 0 || !entregaDesc || Object.keys(validarPedido(rascunho, total)).length > 0) return null;
    try {
      return montarComanda(
        { ...paraDadosPedido(rascunho), entrega: entregaDesc },
        linhas.map((l) => ({
          nome: l.produto.nome, // os nomes são únicos; sem a base, a linha cabe na tela do WhatsApp
          quantidade: l.quantidade,
          acompanhamento: l.acompanhamentoNome,
          extras: l.extras.map((e) => adicionais.find((a) => a.id === e)?.nome ?? ""),
          subtotal: l.subtotal,
        })),
        { subtotal: totalPreco, entrega: taxa, total },
        agora,
      );
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sem itens ou com dados incompletos (ex.: abriu o endereço direto): volta ao carrinho.
  if (!comanda) return <Navigate to="/pedido" replace />;

  /**
   * O link abre o WhatsApp em outra aba. Aqui guardamos a comanda e levamos esta aba para o agradecimento
   * (replace: o "voltar" não retorna a esta tela). O pequeno atraso deixa o link abrir antes de trocar de tela.
   */
  const aoEnviar = () => {
    salvarUltimoPedido({ codigo: comanda.codigo, texto: comanda.texto, tipo: rascunho.tipo });
    limpar();
    window.setTimeout(() => navigate("/pedido/enviado", { replace: true }), 300);
  };

  return (
    <div className="container">
      <div className="pedido final">
        <div className="final-card">
          <div className="final-card__icone"><Check size={40} aria-hidden="true" /></div>
          <h1 className="t-secao">Falta só um passo</h1>
          <p className="t-corpo">
            Toque em enviar para mandar sua comanda no WhatsApp. Só depois disso a cozinha recebe seu pedido.
          </p>
        </div>

        <section aria-labelledby="titulo-resumo-final">
          <h2 className="t-subtitulo" id="titulo-resumo-final">Resumo</h2>
          <p className="previa__ajuda">É assim que a comanda vai aparecer no seu WhatsApp.</p>
          <PreviaComanda texto={comanda.texto} rotuloId="titulo-resumo-final" />
        </section>

        <p className="final__aviso">
          Ao enviar, você concorda com os{" "}
          <Link to="/termos" target="_blank" rel="noopener noreferrer">Termos de Uso</Link> e a{" "}
          <Link to="/privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</Link>.
        </p>

        <div className="final__acoes">
          <a
            className="btn btn--primary btn--lg btn--block"
            href={linkWhatsApp(contato.whatsapp, comanda.texto)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={aoEnviar}
          >
            <Check className="icon" aria-hidden="true" />
            Enviar comanda para o WhatsApp
          </a>
          <ButtonLink to="/pedido" variante="ghost" bloco>Voltar e editar</ButtonLink>
        </div>
      </div>
    </div>
  );
}
