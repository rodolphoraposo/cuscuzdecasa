/** Guarda a comanda enviada só até fechar a aba, para a tela de agradecimento poder reabrir o WhatsApp. */
const CHAVE = "cuscuz-ultimo-pedido-v1";

export interface UltimoPedido { codigo: string; texto: string; tipo: "entrega" | "retirada" }

export function salvarUltimoPedido(p: UltimoPedido) {
  try { sessionStorage.setItem(CHAVE, JSON.stringify(p)); } catch { /* sem armazenamento: segue sem o reenvio */ }
}

export function carregarUltimoPedido(): UltimoPedido | null {
  try {
    const o: unknown = JSON.parse(sessionStorage.getItem(CHAVE) ?? "null");
    if (typeof o !== "object" || o === null) return null;
    const { codigo, texto, tipo } = o as Record<string, unknown>;
    return typeof codigo === "string" && /^#\d{4}$/.test(codigo) && typeof texto === "string" && texto.length > 0 && texto.length <= 4000
      ? { codigo, texto, tipo: tipo === "retirada" ? "retirada" : "entrega" }
      : null;
  } catch {
    return null;
  }
}
