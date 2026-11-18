import { linkWhatsApp } from "./comanda";

/** Mensagens prontas dos botões de WhatsApp (sem dados pessoais; o cliente pode editar antes de enviar). */
export const MENSAGENS_WHATSAPP = {
  geral: "Olá! Vim pelo cardápio digital da Cuscuz de Casa e gostaria de ajuda.",
  area: "Olá! Vim pelo cardápio digital da Cuscuz de Casa e gostaria de saber se vocês entregam no meu endereço.",
} as const;

export type TipoMensagemWhatsApp = keyof typeof MENSAGENS_WHATSAPP;

/** Link do WhatsApp da casa já com a mensagem pronta. */
export const linkWhatsAppContato = (numero: string, tipo: TipoMensagemWhatsApp = "geral") => linkWhatsApp(numero, MENSAGENS_WHATSAPP[tipo]);
