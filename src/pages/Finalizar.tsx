import { Check } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { PreviaComanda } from "../components/PreviaComanda";
import { ButtonLink } from "../components/ui";
import { useCart } from "../context/CartContext";
import { adicionais, contato, taxaEntrega } from "../data/menu";
import { linkWhatsApp, montarComanda } from "../lib/comanda";
import { descricaoEntrega, diaDaEntrega } from "../lib/entrega";
import { carregarRascunho, paraDadosPedido, validarPedido } from "../lib/formulario";
import { proximoNumeroPedido, salvarPedidoOperatta } from "../lib/operatta";
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

  // Dados do pedido (tudo, menos o número) são montados uma vez, ao abrir esta tela.
  const base = useMemo(() => {
    if (linhas.length === 0 || !entregaDesc || Object.keys(validarPedido(rascunho, total)).length > 0) return null;
    try {
      const dadosPedido = { ...paraDadosPedido(rascunho), entrega: entregaDesc };
      const itens = linhas.map((l) => ({
        nome: l.produto.nome, // os nomes são únicos; sem a base, a linha cabe na tela do WhatsApp
        quantidade: l.quantidade,
        acompanhamento: l.acompanhamentoNome,
        extras: l.extras.map((e) => adicionais.find((a) => a.id === e)?.nome ?? ""),
        subtotal: l.subtotal,
      }));
      return { dadosPedido, itens };
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Número sequencial real, pedido ao Operatta uma única vez ao abrir a tela.
  // Se não responder a tempo (ou falhar), fica null — e a comanda cai sozinha
  // no esquema provisório, sem travar o cliente em nenhuma hipótese.
  const [codigoReal, setCodigoReal] = useState<string | null>(null);
  const [numeroResolvido, setNumeroResolvido] = useState(false);
  useEffect(() => {
    let cancelado = false;
    proximoNumeroPedido().then((n) => {
      if (cancelado) return;
      if (n != null) setCodigoReal(`#${String(n).padStart(4, "0")}`);
      setNumeroResolvido(true);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  // dadosPedido e itens ficam junto da comanda para serem reaproveitados ao
  // gravar o mesmo pedido no Operatta (ver aoEnviar), em vez de montar os
  // itens de novo com outra lógica.
  const comanda = useMemo(() => {
    if (!base || !numeroResolvido) return null;
    try {
      return {
        ...montarComanda(base.dadosPedido, base.itens, { subtotal: totalPreco, entrega: taxa, total }, agora, codigoReal ?? undefined),
        ...base,
      };
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeroResolvido, codigoReal]);

  // Sem itens ou com dados incompletos (ex.: abriu o endereço direto): volta ao carrinho.
  if (!base) return <Navigate to="/pedido" replace />;

  // Dados válidos, só esperando o número do Operatta (normalmente é questão de instantes).
  if (!comanda) {
    return (
      <div className="container">
        <div className="pedido final">
          <p className="t-corpo">Preparando sua comanda...</p>
        </div>
      </div>
    );
  }

  /**
   * O link abre o WhatsApp em outra aba. Aqui guardamos a comanda e levamos esta aba para o agradecimento
   * (replace: o "voltar" não retorna a esta tela). O pequeno atraso deixa o link abrir antes de trocar de tela.
   */
  const aoEnviar = () => {
    // Fire-and-forget: nunca atrasa nem bloqueia o envio para o WhatsApp.
    salvarPedidoOperatta(comanda.dadosPedido, comanda.itens, total);
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
