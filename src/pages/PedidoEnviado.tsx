import { Check } from "@phosphor-icons/react";
import { useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { ButtonLink } from "../components/ui";
import { useCart } from "../context/CartContext";
import { empresa } from "../data/empresa";
import { contato } from "../data/menu";
import { linkWhatsApp } from "../lib/comanda";
import { limparRascunho } from "../lib/formulario";
import { carregarUltimoPedido } from "../lib/ultimoPedido";
import { usePageTitle } from "../hooks/usePageTitle";
import { useNoIndex } from "../hooks/useNoIndex";

export default function PedidoEnviado() {
  usePageTitle("Obrigado pelo pedido");
  useNoIndex();
  const { limpar } = useCart();
  const ultimo = useMemo(carregarUltimoPedido, []);

  // O pedido já seguiu para o WhatsApp: esvazia o carrinho e os dados digitados.
  useEffect(() => {
    limpar();
    limparRascunho();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ultimo) return <Navigate to="/" replace />;

  return (
    <div className="container">
      <div className="pedido final">
        <div className="final-card">
          <div className="final-card__icone"><Check size={40} aria-hidden="true" /></div>
          <h1 className="t-secao">Obrigado pelo seu pedido!</h1>
          <p className="t-corpo">
            Abrimos o WhatsApp com a comanda <strong>{ultimo.codigo}</strong>. Confirme o envio por lá e a cozinha começa o preparo.{" "}
            {ultimo.tipo === "retirada"
              ? `Retirada na casa das ${contato.horarioEntrega}. ${empresa.retiradaInstrucao}`
              : `Entregamos das ${contato.horarioEntrega}.`}
          </p>
        </div>

        <p className="final__aviso">
          O WhatsApp não abriu?{" "}
          <a href={linkWhatsApp(contato.whatsapp, ultimo.texto)} target="_blank" rel="noopener noreferrer">Enviar a comanda de novo</a>
        </p>

        <ButtonLink to="/" tamanho="lg" bloco>Voltar para o início</ButtonLink>
      </div>
    </div>
  );
}
