/**
 * Preparação global dos testes. O jsdom não implementa scrollIntoView (o navegador implementa),
 * e o ScrollManager e o botão "Peça agora" o chamam ao ir para uma âncora como /#cardapio.
 * Sem isto, o vitest acusa "scrollIntoView is not a function" e termina com erro, mesmo com todos os testes passando.
 */
if (typeof Element !== "undefined" && typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

globalThis.fetch = (async (input: RequestInfo | URL) => {
  if (String(input).includes("/api/feriados")) {
    return { ok: true, json: async () => ({ feriados: [] }) } as Response;
  }
  throw new Error(`fetch não simulado no teste: ${String(input)}`);
}) as typeof fetch;
