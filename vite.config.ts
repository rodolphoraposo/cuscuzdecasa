/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Pré-carrega as fontes do topo da página (títulos e texto). Sem isso, o texto aparece com a fonte
 * reserva e "pula" quando a fonte chega (deslocamento de layout). Só vale no build: os nomes ganham um hash.
 */
const preCarregarFontes = (): Plugin => ({
  name: "pre-carregar-fontes",
  transformIndexHtml: {
    order: "post",
    handler(_html, ctx) {
      if (!ctx.bundle) return; // servidor de desenvolvimento
      const essenciais = [/baloo-2-latin-800-normal-.*\.woff2$/, /baloo-2-latin-700-normal-.*\.woff2$/, /nunito-sans-latin-wght-normal-.*\.woff2$/];
      return Object.keys(ctx.bundle)
        .filter((arquivo) => essenciais.some((r) => r.test(arquivo)))
        .map((arquivo) => ({
          tag: "link",
          attrs: { rel: "preload", as: "font", type: "font/woff2", href: `/${arquivo}`, crossorigin: "" },
          injectTo: "head" as const,
        }));
    },
  },
});

export default defineConfig({
  plugins: [react(), preCarregarFontes()],
  test: {
    setupFiles: ["./src/test/setup.ts"],
    // Os testes de tela simulam digitação e cliques de verdade; em computadores mais lentos 5 s (padrão) não bastam.
    testTimeout: 20000,
  },
});
