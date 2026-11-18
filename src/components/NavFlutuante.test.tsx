// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { CartProvider } from "../context/CartContext";
import * as analytics from "../lib/analytics";

const abrir = (rota: string) => render(<MemoryRouter initialEntries={[rota]}><CartProvider><App /></CartProvider></MemoryRouter>);
const nav = () => screen.getByRole("navigation", { name: "Navegação principal" });

beforeAll(() => { window.scrollTo = vi.fn() as unknown as typeof window.scrollTo; });
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("navegação flutuante", () => {
  it("tem 5 destinos: Início, Cardápio, Pedido (no centro), Encomendas e WhatsApp", () => {
    abrir("/");
    const links = within(nav()).getAllByRole("link");
    expect(links).toHaveLength(5);
    expect(links.map((l) => l.textContent?.replace(/\(abre em outra aba\)/, "").trim())).toEqual(["Início", "Cardápio", "", "Encomendas", "WhatsApp"]);
    expect(within(nav()).getByRole("link", { name: "Encomendas" }).getAttribute("href")).toBe("/encomenda");
    expect(within(nav()).getByRole("link", { name: "Início" }).getAttribute("href")).toBe("/");
    expect(within(nav()).getByRole("link", { name: /WhatsApp/ }).getAttribute("href")).toMatch(/^https:\/\/wa\.me\/55829\d+\?text=Ol%C3%A1/); // abre com mensagem pronta
    expect(within(nav()).getByRole("link", { name: /WhatsApp/ }).getAttribute("target")).toBe("_blank");
  });

  it("o botão do centro mostra o estado do pedido: vazio, depois quantidade e total", () => {
    abrir("/");
    const pedido = within(nav()).getByRole("link", { name: "Pedido vazio" });
    expect(pedido.getAttribute("href")).toBe("/pedido");
    expect(pedido.textContent).toBe(""); // sem selo nem total quando vazio
    cleanup();

    localStorage.setItem("cuscuz-pedido-v3", JSON.stringify([{ id: "carne-de-sol", qtd: 2, extras: [], acomp: "vinagrete" }]));
    abrir("/");
    const cheio = within(nav()).getByRole("link", { name: /Pedido: 2 itens, R\$\s43,98/ });
    expect(cheio.textContent).toMatch(/2/);
    expect(cheio.textContent).toMatch(/R\$\s43,98/);
  });

  it("marca a página atual (aria-current) e some nas telas do pedido", () => {
    abrir("/encomenda");
    expect(within(nav()).getByRole("link", { name: "Encomendas" }).getAttribute("aria-current")).toBe("page");
    expect(within(nav()).getByRole("link", { name: "Início" }).getAttribute("aria-current")).toBeNull();
    cleanup();

    abrir("/");
    expect(within(nav()).getByRole("link", { name: "Início" }).getAttribute("aria-current")).toBe("page");
    cleanup();

    for (const rota of ["/pedido", "/cardapio/carne-de-sol"]) {
      abrir(rota);
      expect(screen.queryByRole("navigation", { name: "Navegação principal" })).toBeNull();
      cleanup();
    }
  });

  it("destaca Cardápio ao selecioná-lo e volta a destacar Início ao selecioná-lo", async () => {
    const u = userEvent.setup();
    abrir("/");
    const navAtual = within(nav());
    const inicio = navAtual.getByRole("link", { name: "Início" });
    const cardapio = navAtual.getByRole("link", { name: "Cardápio" });

    expect(inicio.getAttribute("aria-current")).toBe("page");
    await u.click(cardapio);
    expect(cardapio.getAttribute("aria-current")).toBe("page");
    expect(inicio.getAttribute("aria-current")).toBeNull();

    await u.click(inicio);
    expect(inicio.getAttribute("aria-current")).toBe("page");
    expect(cardapio.getAttribute("aria-current")).toBeNull();
  });

  it("os toques são registrados no Analytics sem dados pessoais; 'Cardápio' informa a origem", async () => {
    const eventos = vi.spyOn(analytics, "registrarEvento").mockImplementation(() => {});
    const u = userEvent.setup();
    abrir("/");
    await u.click(within(nav()).getByRole("link", { name: "Cardápio" }));
    await u.click(within(nav()).getByRole("link", { name: /WhatsApp/ }));
    await u.click(within(nav()).getByRole("link", { name: "Pedido vazio" })); // no pedido vazio a tela do pedido avisa
    expect(eventos).toHaveBeenCalledWith("clique_peca_agora", { origem: "nav_flutuante" });
    expect(eventos).toHaveBeenCalledWith("clique_nav", { item: "whatsapp" });
    expect(eventos).toHaveBeenCalledWith("clique_nav", { item: "pedido" });
  });

  it("'Início' na própria Home sobe ao topo em vez de recarregar", async () => {
    const u = userEvent.setup();
    abrir("/");
    vi.mocked(window.scrollTo).mockClear();
    await u.click(within(nav()).getByRole("link", { name: "Início" }));
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });
});
