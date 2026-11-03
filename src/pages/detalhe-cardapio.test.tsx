// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import App from "../App";
import { CartProvider } from "../context/CartContext";

const Local = () => { const l = useLocation(); return <output data-testid="local">{l.pathname + l.search}</output>; };
const abrir = (rota: string) =>
  render(<MemoryRouter initialEntries={[rota]}><CartProvider><App /><Local /></CartProvider></MemoryRouter>);
const local = () => screen.getByTestId("local").textContent;

beforeAll(() => { window.scrollTo = vi.fn() as unknown as typeof window.scrollTo; });
afterEach(() => { cleanup(); localStorage.clear(); });

describe("sequência do pedido: prato → capriche → bebida", () => {
  it("lista mostra os novos nomes e 'Pedir' do salgado abre o Detalhe", async () => {
    const u = userEvent.setup();
    abrir("/cardapio");
    for (const n of ["Cuscuz Asa Branca", "Cuscuz do Sertão", "Cuscuz Arretado", "Cuscuz Tropeiro", "Cuscuz de Feira"]) {
      expect(screen.getByRole("link", { name: n })).toBeTruthy();
    }
    await u.click(screen.getByRole("link", { name: "Pedir Cuscuz do Sertão" }));
    expect(local()).toBe("/cardapio/carne-de-sol");
    expect(screen.getByText(/Adicione Queijo Coalho tostado/)).toBeTruthy();
  });

  it("exige acompanhamento; depois leva às bebidas com a sugestão", async () => {
    const u = userEvent.setup();
    abrir("/cardapio/carne-de-sol");
    await u.click(screen.getByRole("button", { name: /Adicionar · / }));
    expect(screen.getByRole("alert").textContent).toContain("Escolha o acompanhamento");
    expect(local()).toBe("/cardapio/carne-de-sol");

    await u.click(screen.getByRole("radio", { name: "Refogado especial da casa" }));
    await u.click(screen.getByRole("checkbox", { name: /Queijo coalho/ }));
    await u.click(screen.getByRole("button", { name: /Adicionar · / }));

    expect(local()).toBe("/cardapio?categoria=bebidas");
    expect(screen.getByText(/Quer uma bebida para acompanhar/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Não quero bebida/ }).getAttribute("href")).toBe("/pedido");
    expect(screen.getByRole("link", { name: /Ver pedido · 1 item/ })).toBeTruthy();

    await u.click(screen.getByRole("tab", { name: "Salgados" })); // trocar de aba encerra a sugestão
    expect(screen.queryByText(/Quer uma bebida/)).toBeNull();
  });

  it("doce não pede acompanhamento: 'Pedir' adiciona direto", async () => {
    const u = userEvent.setup();
    abrir("/cardapio?categoria=doces");
    await u.click(screen.getByRole("button", { name: "Pedir Cuscuz Cartola" }));
    expect(within(screen.getByRole("group", { name: "Quantidade de Cuscuz Cartola" })).getByRole("status")).toBeTruthy();
    abrir("/cardapio/cartola");
    expect(screen.queryByRole("radio", { name: "Vinagrete da casa" })).toBeNull();
  });

  it("carrinho antigo, de salgado sem acompanhamento, é descartado", () => {
    localStorage.setItem("cuscuz-pedido-v3", JSON.stringify([{ id: "carne-de-sol", qtd: 2, extras: [] }]));
    abrir("/cardapio");
    expect(screen.queryByRole("link", { name: /Ver pedido/ })).toBeNull();
  });
});
