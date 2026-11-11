// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ID_DA_METRICA, iniciarAnalytics, registrarPagina } from "./analytics";

const scripts = () => Array.from(document.head.querySelectorAll<HTMLScriptElement>('script[src*="googletagmanager.com"]'));

beforeEach(() => {
  delete window.gtag;
  delete window.dataLayer;
  document.head.innerHTML = "";
});
afterEach(() => vi.unstubAllEnvs());

describe("Google Analytics", () => {
  it("usa o ID de métrica do fluxo Cuscuz de Casa", () => {
    expect(ID_DA_METRICA).toBe("G-BPLLS21H2B");
  });

  it("em desenvolvimento e nos testes não carrega nada nem envia nada", () => {
    iniciarAnalytics();
    registrarPagina();
    expect(scripts()).toHaveLength(0);
    expect(window.gtag).toBeUndefined();
  });

  it("no site publicado carrega o gtag.js uma única vez, com o ID certo e sem enviar página sozinho", () => {
    vi.stubEnv("PROD", true);
    iniciarAnalytics();
    iniciarAnalytics(); // chamar de novo não duplica
    expect(scripts()).toHaveLength(1);
    expect(scripts()[0].src).toBe(`https://www.googletagmanager.com/gtag/js?id=${ID_DA_METRICA}`);
    const comandos = (window.dataLayer as ArrayLike<unknown>[]).map((c) => Array.from(c));
    expect(comandos[0][0]).toBe("js");
    expect(comandos[1]).toEqual(["config", ID_DA_METRICA, expect.objectContaining({ send_page_view: false, allow_google_signals: false })]);
  });

  it("registrarPagina envia um page_view com endereço, caminho e título", () => {
    vi.stubEnv("PROD", true);
    iniciarAnalytics();
    document.title = "Do Sertão · Cuscuz de Casa";
    registrarPagina();
    const fila = window.dataLayer as ArrayLike<unknown>[];
    const ultimo = Array.from(fila[fila.length - 1]);
    expect(ultimo[0]).toBe("event");
    expect(ultimo[1]).toBe("page_view");
    expect(ultimo[2]).toEqual(expect.objectContaining({ page_title: "Do Sertão · Cuscuz de Casa", page_path: window.location.pathname }));
  });
});
