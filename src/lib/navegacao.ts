/**
 * O Detalhe do item recebe, via state do link, a página de onde o cliente veio (ex.: "/cardapio?categoria=doces&vista=grade").
 * Só aceita caminhos internos simples: bloqueia "//site.com", "/\site.com" e endereços completos.
 */
export function origemSegura(state: unknown): string | null {
  const voltar = (state as { voltar?: unknown } | null)?.voltar;
  return typeof voltar === "string" && /^\/(?![/\\])[^\\\s]*$/.test(voltar) ? voltar : null;
}
