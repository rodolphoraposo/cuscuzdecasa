/**
 * Integração com o Operatta (Supabase): grava o pedido no sistema interno
 * em paralelo ao envio da comanda pro WhatsApp.
 *
 * Mesmo padrão já usado em produção pelo cardápio da Pizzaria Forno à
 * Lenha: a gravação é "fire-and-forget" e falha em silêncio. Se o
 * Supabase não responder (ou o company_id ainda não existir), o WhatsApp
 * abre do mesmo jeito e o pedido do cliente NUNCA se perde — só deixa de
 * aparecer no painel do Operatta.
 *
 * IMPORTANTE: troque OPERATTA_COMPANY_ID pelo UUID real assim que o
 * tenant "Cuscuz de Casa" for criado no Operatta (módulo Usuário → Nova
 * empresa). Até lá, toda gravação falha em silêncio (company_id
 * inválido) e não afeta o site.
 */
import type { DadosPedido, ItemComanda } from "./comanda";

const OPERATTA_URL = "https://pzwcbbdtqbwmzszgymrd.supabase.co";

/** Chave pública (anon). É a mesma usada por todo cardápio conectado ao
 *  Operatta — a segurança vem das políticas de RLS por company_id, não
 *  do sigilo desta chave. */
const OPERATTA_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6d2NiYmR0cWJ3bXpzemd5bXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTAyNjQsImV4cCI6MjA5Mjc4NjI2NH0.IERyMN7cbF40ctOYGxKN3o6dC9Ohq8l7vxRSxXRY_AI";

const OPERATTA_COMPANY_ID = "eaeb443e-c4b3-4621-b80f-cccf50cc3507"; // Cuscuz de Casa

function idPedido(): string {
  return "cdg-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
}

/**
 * Pede ao Operatta o próximo número sequencial do pedido (via RPC
 * `proximo_numero_pedido`, que incrementa a tabela order_counters de forma
 * atômica — sem risco de dois clientes pegarem o mesmo número).
 *
 * Nunca trava o cliente: desiste sozinho depois de 3s e devolve null. Quem
 * chamar deve cair no esquema provisório (numeroPedido) quando vier null.
 */
export async function proximoNumeroPedido(): Promise<number | null> {
  const controller = new AbortController();
  const limite = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${OPERATTA_URL}/rest/v1/rpc/proximo_numero_pedido`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: OPERATTA_ANON_KEY,
        Authorization: `Bearer ${OPERATTA_ANON_KEY}`,
      },
      body: JSON.stringify({ p_company_id: OPERATTA_COMPANY_ID }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const n = await res.json();
    return typeof n === "number" && Number.isFinite(n) ? n : null;
  } catch (err) {
    console.warn("[Operatta] Falha ao buscar numero sequencial, usando esquema provisorio:", err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(limite);
  }
}

/**
 * Grava o pedido no Operatta via REST do Supabase (sem backend próprio).
 * Nunca lança erro para quem chama: falha de rede ou company_id inválido
 * só geram um aviso no console.
 */
export function salvarPedidoOperatta(
  dados: DadosPedido,
  itens: ItemComanda[],
  total: number,
  /** Mesmo número sequencial usado na comanda do WhatsApp (de proximoNumeroPedido).
   *  Sem ele, o Operatta exibe um número local só daquele navegador — por
   *  isso ele é o que faz o número bater entre o WhatsApp e o Painel. */
  numero?: number | null,
): void {
  try {
    const itensPedido = itens.map((i) => ({
      name: i.nome,
      qty: i.quantidade,
      price: i.quantidade > 0 ? Math.round((i.subtotal / i.quantidade) * 100) / 100 : i.subtotal,
      ...(i.acompanhamento ? { acompanhamento: i.acompanhamento } : {}),
      ...(i.extras.length ? { extras: i.extras } : {}),
    }));

    const retirada = dados.tipo === "retirada";

    const payload = {
      id: idPedido(),
      company_id: OPERATTA_COMPANY_ID,
      ...(numero != null ? { numero: String(numero) } : {}),
      status: "Novo",
      channel: retirada ? "Balcão" : "Delivery",
      origin: "cardapio-digital",
      customer: dados.nome || "Cliente Online",
      phone: dados.telefone || "",
      address: retirada ? "" : [dados.rua, dados.numero, dados.bairro].filter(Boolean).join(", "),
      items: JSON.stringify(itensPedido),
      total,
      payment: dados.pagamento || "dinheiro",
      obs: dados.observacoes || "",
      created_at: new Date().toISOString(),
    };

    fetch(`${OPERATTA_URL}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: OPERATTA_ANON_KEY,
        Authorization: `Bearer ${OPERATTA_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      })
      .catch((err) => {
        console.warn("[Operatta] Falha ao registrar pedido:", err instanceof Error ? err.message : err);
      });
  } catch (err) {
    console.warn("[Operatta] Falha ao montar payload do pedido:", err instanceof Error ? err.message : err);
  }
}
