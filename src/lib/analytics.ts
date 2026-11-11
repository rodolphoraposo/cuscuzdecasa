/**
 * Google Analytics 4 (gtag.js), ligado ao fluxo "Cuscuz de Casa" (www.cuscuzdecasa.com.br).
 *
 * - Só funciona no site publicado (build de produção): em desenvolvimento e nos testes nada é carregado nem enviado,
 *   para não sujar os números com acessos de teste.
 * - O script do Google é carregado por aqui (não por um <script> no index.html), porque a política de segurança
 *   (CSP) do vercel.json só aceita scripts do próprio site e dos endereços do Google listados lá.
 * - Como o site troca de tela sem recarregar a página, as visualizações de página são enviadas à mão
 *   (RastreadorDePaginas), uma por tela, e o envio automático do gtag fica desligado (send_page_view: false).
 */

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
