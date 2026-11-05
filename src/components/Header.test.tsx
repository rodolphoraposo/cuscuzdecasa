// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import App from "../App";
import { CartProvider } from "../context/CartContext";

const Local = () => { const l = useLocation(); return <output data-testid="local">{l.pathname + l.hash}</output>; };
const abrir = (rota = "/") => render(<MemoryRouter initialEntries={[rota]}><CartProvider><App /><Local /></CartProvider></MemoryRouter>);

beforeAll(() => { window.scrollTo = vi.fn() as unknown as typeof window.scrollTo; });
afterEach(() => { cleanup(); localStorage.clear(); });

describe("cabeçalho no celular", () => {
  it("menu hambúrguer abre, navega e fecha", async () => {
    const u = userEvent.setup();
    abrir();
    const botao = screen.getByRole("button", { name: "Abrir menu" });
    expect(botao.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("navigation", { name: "Menu" })).toBeNull(); // fechado: fora da árvore de acessibilidade

    await u.click(botao);
    expect(screen.getByRole("button", { name: "Fechar menu" }).getAttribute("aria-expanded")).toBe("true");
    const menu = screen.getByRole("navigation", { name: "Menu" });
    expect(menu.textContent).toContain("Onde entregamos");

    await u.click(within(menu).getByRole("link", { name: "Cardápio" })); // há outro "Cardápio" no menu de computador
    expect(screen.getByTestId("local").textContent).toBe("/cardapio");
    expect(screen.queryByRole("navigation", { name: "Menu" })).toBeNull(); // fechou ao navegar
  });

  it("Esc fecha o menu", async () => {
    const u = userEvent.setup();
    abrir();
    await u.click(screen.getByRole("button", { name: "Abrir menu" }));
    await u.keyboard("{Escape}");
    expect(screen.queryByRole("navigation", { name: "Menu" })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Abrir menu" })); // foco devolvido ao botão
  });

  it("sacola com a quantidade só aparece quando há itens", () => {
    abrir();
    expect(screen.queryByRole("link", { name: /Ver pedido,/ })).toBeNull();
    cleanup();
    localStorage.setItem("cuscuz-pedido-v3", JSON.stringify([{ id: "coca-cola", qtd: 2, extras: [], acomp: null }]));
    abrir();
    expect(screen.getByRole("link", { name: "Ver pedido, 2 itens" }).getAttribute("href")).toBe("/pedido");
  });
});
