/**
 * Google Analytics 4 (gtag.js), ligado ao fluxo "Cuscuz de Casa" (www.cuscuzdecasa.com.br).
 *
 * - Só funciona no site publicado (build de produção): em desenvolvimento e nos testes nada é carregado nem enviado,
 *   para não sujar os números com acessos de teste.
 * - O script do Google é carregado por aqui (não por um <script> no index.html), porque a política de segurança
 *   (CSP) do vercel.json só aceita scripts do próprio site e dos endereços do Google listados lá.
 * - Como o site troca de tela sem recarregar a página, as visualizações de página são enviadas à mão
 *   (RastreadorDePaginas), uma por tela, e o envio automático do gtag fica desligado (send_page_view: false).
<<<<<<< HEAD
 * - Funil do pedido: usa os eventos padrão de e-commerce do GA4 (view_item_list, select_item, view_item, add_to_cart,
 *   remove_from_cart, view_cart, begin_checkout, purchase), que alimentam os relatórios de monetização.
 *   "purchase" = comanda ENVIADA ao WhatsApp (o pagamento é combinado por lá, então não é venda confirmada).
 * - Nenhum dado pessoal (nome, telefone, endereço) vai para o Analytics: só produtos, quantidades e valores.
 */
import type { Produto } from "../data/menu";
=======
 */
>>>>>>> 5fa7d297b0c640f24cbe3bbc959e18c4cf59712c

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** ID de métrica do fluxo de dados (público: aparece no código de qualquer site que usa o GA). Pode ser trocado por VITE_GA_ID. */
export const ID_DA_METRICA: string = import.meta.env.VITE_GA_ID || "G-BPLLS21H2B";

const ativo = () => import.meta.env.PROD && Boolean(ID_DA_METRICA);

/** Carrega o gtag.js uma única vez. Chame antes de renderizar o app. */
export function iniciarAnalytics(): void {
  if (!ativo() || typeof document === "undefined" || window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  // O gtag precisa empurrar o objeto `arguments` (e não um array) para o dataLayer.
  window.gtag = function gtag() {
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", ID_DA_METRICA, {
    send_page_view: false, // as visualizações de página são enviadas por registrarPagina()
    allow_google_signals: false, // sem recursos de publicidade e remarketing
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ID_DA_METRICA)}`;
  document.head.appendChild(script);
}

/** Envia uma visualização de página (a tela atual). */
export function registrarPagina(): void {
  if (!ativo() || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
  });
}
<<<<<<< HEAD

/** Envia um evento do GA4 (no-op fora do site publicado). */
export function registrarEvento(nome: string, parametros: Record<string, unknown> = {}): void {
  if (!ativo() || !window.gtag) return;
  window.gtag("event", nome, parametros);
}

/** Item no formato do GA4. Sem dados pessoais: só o que o cliente escolheu. */
export function itemDoProduto(produto: Produto, opcoes: { quantidade?: number; preco?: number; variante?: string | null } = {}) {
  return {
    item_id: produto.id,
    item_name: produto.nome,
    item_category: produto.prato ?? produto.categoria, // cuscuz | macaxeira | bebidas
    ...(produto.prato ? { item_category2: produto.categoria } : {}), // salgados | doces
    ...(opcoes.variante ? { item_variant: opcoes.variante } : {}),
    price: opcoes.preco ?? produto.preco,
    quantity: opcoes.quantidade ?? 1,
  };
}

/** Linhas do carrinho → itens do GA4. */
export function itensDoCarrinho(linhas: { produto: Produto; quantidade: number; precoUnitario: number; acompanhamentoNome: string | null }[]) {
  return linhas.map((l) => itemDoProduto(l.produto, { quantidade: l.quantidade, preco: l.precoUnitario, variante: l.acompanhamentoNome }));
}

export const MOEDA = "BRL";
=======
>>>>>>> 5fa7d297b0c640f24cbe3bbc959e18c4cf59712c
