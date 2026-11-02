import { Check } from "@phosphor-icons/react";
import { useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Banner, Button, ButtonLink } from "../components/ui";
import { useCart } from "../context/CartContext";
import { adicionais, contato, formatarPreco, taxaEntrega } from "../data/menu";
import { brl, linkWhatsApp, montarComanda } from "../lib/comanda";
import { carregarRascunho, limparRascunho, paraDadosPedido, validarPedido } from "../lib/formulario";
import { usePageTitle } from "../hooks/usePageTitle";

const ROTULO = { pix: "Pix", dinheiro: "Dinheiro", cartao: "Cartão na entrega" } as const;

export default function Finalizar() {
  usePageTitle("Finalizar pedido");
  const navigate = useNavigate();
  const { linhas, totalItens, totalPreco, limpar } = useCart();
  const total = Math.round((totalPreco + taxaEntrega) * 100) / 100;
  const [enviado, setEnviado] = useState(false);
  const concluido = useRef(false);
  const rascunho = useMemo(carregarRascunho, []);

  // O código do pedido (data e hora) é gerado uma vez, ao abrir esta tela.
  const comanda = useMemo(() => {
    if (linhas.length === 0 || Object.keys(validarPedido(rascunho, total)).length > 0) return null;
    try {
      return montarComanda(
        paraDadosPedido(rascunho),
        linhas.map((l) => ({
          nome: l.produto.nome,
          quantidade: l.quantidade,
          extras: l.extras.map((e) => adicionais.find((a) => a.id === e)?.nome ?? ""),
          subtotal: l.subtotal,
        })),
        { subtotal: totalPreco, entrega: taxaEntrega, total },
      );
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sem itens ou com dados incompletos (ex.: abriu o endereço direto): volta ao carrinho.
  if (!comanda) return concluido.current ? null : <Navigate to="/pedido" replace />;

  const r = rascunho;
  const pagamento =
    r.pagamento === "dinheiro"
      ? r.semTroco ? "Dinheiro · sem troco" : `Dinheiro · troco para ${brl(Number(paraDadosPedido(r).trocoPara))}`
      : ROTULO[r.pagamento as keyof typeof ROTULO];

  const novoPedido = () => {
    concluido.current = true;
    limpar();
    limparRascunho();
    navigate("/");
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
          <dl className="resumo">
            <div><dt>Pedido</dt><dd>{comanda.codigo}</dd></div>
            <div><dt>Itens</dt><dd>{totalItens} {totalItens === 1 ? "item" : "itens"}</dd></div>
            <div><dt>Total</dt><dd>{formatarPreco(total)}</dd></div>
          </dl>
          <dl className="resumo resumo--detalhes">
            <div className="resumo--bloco">
              <dt>Endereço</dt>
              <dd>{`${r.rua}, ${r.numero} · ${r.complemento} · ${r.bairro}, ${r.cidade}/${r.uf}`}</dd>
            </div>
            <div className="resumo--bloco"><dt>Pagamento</dt><dd>{pagamento}</dd></div>
            <div className="resumo__total"><dt>Total</dt><dd>{formatarPreco(total)}</dd></div>
          </dl>
        </section>

        {enviado && (
          <Banner tipo="sucesso">
            Abrimos o WhatsApp com a sua comanda. Confirme o envio por lá. Se não abriu, toque em enviar de novo.
          </Banner>
        )}

        <div className="final__acoes">
          <a
            className="btn btn--primary btn--lg btn--block"
            href={linkWhatsApp(contato.whatsapp, comanda.texto)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setEnviado(true)}
          >
            <Check className="icon" aria-hidden="true" />
            Enviar comanda para o WhatsApp
          </a>
          {enviado ? (
            <Button variante="outline" bloco onClick={novoPedido}>Já enviei · Começar novo pedido</Button>
          ) : (
            <ButtonLink to="/pedido" variante="ghost" bloco>Voltar e editar</ButtonLink>
          )}
        </div>
      </div>
    </div>
  );
}
