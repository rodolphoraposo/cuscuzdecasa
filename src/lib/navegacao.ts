/**
 * O Detalhe do item recebe, via state do link, a página de onde o cliente veio (ex.: "/?categoria=doces&vista=grade#cardapio").
 * Só aceita caminhos internos simples: bloqueia "//site.com", "/\site.com" e endereços completos.
 */
export function origemSegura(state: unknown): string | null {
  const voltar = (state as { voltar?: unknown } | null)?.voltar;
  return typeof voltar === "string" && /^\/(?![/\\])[^\\\s]*$/.test(voltar) ? voltar : null;
}

/** Endereço do cardápio na Home, mantendo prato, categoria e vista (ex.: "/?categoria=doces#cardapio"). */
export function enderecoDoCardapio(search = ""): string {
  const q = search.startsWith("?") ? search : search ? `?${search}` : "";
  return `/${q}#cardapio`;
}
