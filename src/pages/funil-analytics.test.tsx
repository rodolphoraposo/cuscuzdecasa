// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import App from "../App";
import { CartProvider } from "../context/CartContext";
import * as analytics from "../lib/analytics";

const abrir = (rota: string) => render(<MemoryRouter initialEntries={[rota]}><CartProvider><App /></CartProvider></MemoryRouter>);
let eventos: MockInstance<typeof analytics.registrarEvento>;
const chamadas = (nome: string) => eventos.mock.calls.filter((c) => c[0] === nome).map((c) => c[1] as Record<string, any>);

beforeAll(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-03T18:00:00Z"));
});
beforeEach(() => {
  eventos = vi.spyOn(analytics, "registrarEvento").mockImplementation(() => {});
  // O jsdom não tem IntersectionObserver: este avisa na hora que o cardápio está visível.
  vi.stubGlobal("IntersectionObserver", class {
    constructor(private cb: (e: { isIntersecting: boolean }[]) => void) {}
    observe() { this.cb([{ isIntersecting: true }]); }
    disconnect() {}
  });
});
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("funil do pedido no Google Analytics", () => {
  it("cardápio visto: view_item_list com os itens da lista; trocar de aba envia a nova lista", async () => {
    const u = userEvent.setup();
    abrir("/");
    const primeira = chamadas("view_item_list");
    expect(primeira).toHaveLength(1);
    expect(primeira[0]).toMatchObject({ item_list_id: "cuscuz_todos", item_list_name: "Cuscuz · Todos" });
    expect(primeira[0].items).toHaveLength(6);
    await u.click(screen.getByRole("tab", { name: "Doces" }));
    const listas = chamadas("view_item_list");
    expect(listas[listas.length - 1]).toMatchObject({ item_list_id: "cuscuz_doces" });
  });

  it("Pedir (doce) → add_to_cart; − remove → remove_from_cart; com valor, moeda e item", async () => {
    const u = userEvent.setup();
    abrir("/?categoria=doces");
    await u.click(screen.getByRole("button", { name: "Pedir Cartola (cuscuz)" }));
    expect(chamadas("add_to_cart")).toEqual([
      expect.objectContaining({ currency: "BRL", value: 17.99, items: [expect.objectContaining({ item_id: "cartola", item_category: "cuscuz", item_category2: "doces", price: 17.99, quantity: 1 })] }),
    ]);
    await u.click(screen.getByRole("button", { name: /Remover um/ }));
    expect(chamadas("remove_from_cart")).toHaveLength(1);
    expect(chamadas("remove_from_cart")[0].items[0]).toMatchObject({ quantity: 1 });
  });

  it("abrir um item: select_item no clique e view_item no Detalhe", async () => {
    const u = userEvent.setup();
    abrir("/");
    await u.click(screen.getByRole("link", { name: "Do Sertão" }));
    expect(chamadas("select_item")).toEqual([expect.objectContaining({ item_list_id: "cardapio_home", items: [expect.objectContaining({ item_id: "carne-de-sol" })] })]);
    expect(chamadas("view_item")).toEqual([expect.objectContaining({ currency: "BRL", items: [expect.objectContaining({ item_id: "carne-de-sol" })] })]);
  });

  it("cada botão 'Peça agora' informa de onde veio o clique", async () => {
    const u = userEvent.setup();
    abrir("/");
    const [cabecalho, hero] = screen.getAllByRole("link", { name: "Peça agora!" });
    await u.click(cabecalho);
    await u.click(hero);
    expect(chamadas("clique_peca_agora")).toEqual([{ origem: "cabecalho_peca_agora" }, { origem: "hero_peca_agora" }]);
  });
});
