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

beforeAll(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-03T18:00:00Z")); // 15:00 em Maceió
});
afterEach(() => { cleanup(); localStorage.clear(); });

describe("sequência do pedido: prato → capriche → bebida", () => {
  it("lista mostra os novos nomes e 'Pedir' do salgado abre o Detalhe", async () => {
    const u = userEvent.setup();
    abrir("/cardapio");
    for (const n of ["Asa Branca", "Do Sertão", "Arretado", "Tropeiro", "De Feira"]) {
      expect(screen.getByRole("link", { name: n })).toBeTruthy();
    }
    await u.click(screen.getByRole("link", { name: "Pedir Do Sertão (cuscuz)" }));
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
    await u.click(screen.getByRole("button", { name: "Pedir Cartola (cuscuz)" }));
    expect(within(screen.getByRole("group", { name: "Quantidade de Cartola (cuscuz)" })).getByRole("status")).toBeTruthy();
    abrir("/cardapio/cartola");
    expect(screen.queryByRole("radio", { name: "Vinagrete da casa" })).toBeNull();
  });

  it("carrinho antigo, de salgado sem acompanhamento, é descartado", () => {
    localStorage.setItem("cuscuz-pedido-v3", JSON.stringify([{ id: "carne-de-sol", qtd: 2, extras: [] }]));
    abrir("/cardapio");
    expect(screen.queryByRole("link", { name: /Ver pedido/ })).toBeNull();
  });

  it("macaxeira: escolher o prato mostra os 5 salgados, com foto provisória e acompanhamento", async () => {
    const u = userEvent.setup();
    abrir("/cardapio");
    expect(screen.queryByRole("link", { name: "Aprumada" })).toBeNull();
    await u.click(screen.getByRole("button", { name: "Macaxeira" }));
    expect(local()).toBe("/cardapio?prato=macaxeira");
    for (const n of ["Aprumada", "Fulô de Mandacaru", "Quintura", "Arriégua", "Da Terra"]) {
      expect(screen.getByRole("link", { name: n })).toBeTruthy();
    }
    expect(screen.getAllByRole("img", { name: /em breve/ }).length).toBe(5);
    await u.click(screen.getByRole("tab", { name: "Doces" }));
    expect(screen.getByRole("link", { name: "Luar do Sertão" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Xodózin" })).toBeTruthy();
    await u.click(screen.getByRole("tab", { name: "Bebidas" }));
    expect(screen.queryByRole("group", { name: "Escolha o prato" })).toBeNull(); // bebidas valem para qualquer prato
  });

  it("macaxeira salgada pede acompanhamento e entra no pedido com o nome completo", async () => {
    const u = userEvent.setup();
    abrir("/cardapio/macaxeira-frango");
    await u.click(screen.getByRole("radio", { name: "Vinagrete da casa" }));
    await u.click(screen.getByRole("button", { name: /Adicionar · / }));
    expect(local()).toBe("/cardapio?categoria=bebidas");
    expect(JSON.parse(localStorage.getItem("cuscuz-pedido-v3") ?? "[]")[0]).toMatchObject({ id: "macaxeira-frango", acomp: "vinagrete" });
  });
});
