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
    abrir("/");
    for (const n of ["Asa Branca", "Do Sertão", "Arretado", "De Feira"]) {
      expect(screen.getByRole("link", { name: n })).toBeTruthy();
    }
    await u.click(screen.getByRole("link", { name: "Pedir Do Sertão (cuscuz)" }));
    expect(local()).toBe("/cardapio/carne-de-sol");
    expect(screen.getByText(/Adicione queijo coalho ou requeijão tipo Catupiry/)).toBeTruthy();
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

    expect(local()).toBe("/?prato=bebidas");
    expect(screen.getByText(/Quer uma bebida para acompanhar/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Não quero bebida/ }).getAttribute("href")).toBe("/pedido");
    expect(screen.getByRole("link", { name: /Ver pedido · 1 item/ })).toBeTruthy();

    await u.click(screen.getByRole("button", { name: "Cuscuz" })); // trocar de seção encerra a sugestão
    expect(screen.queryByText(/Quer uma bebida/)).toBeNull();
  });

  it("doce não pede acompanhamento: 'Pedir' adiciona direto", async () => {
    const u = userEvent.setup();
    abrir("/?categoria=doces");
    await u.click(screen.getByRole("button", { name: "Pedir Cartola (cuscuz)" }));
    expect(within(screen.getByRole("group", { name: "Quantidade de Cartola (cuscuz)" })).getByRole("status")).toBeTruthy();
    abrir("/cardapio/cartola");
    expect(screen.queryByRole("radio", { name: "Vinagrete da casa" })).toBeNull();
  });

  it("carrinho antigo, de salgado sem acompanhamento, é descartado", () => {
    localStorage.setItem("cuscuz-pedido-v3", JSON.stringify([{ id: "carne-de-sol", qtd: 2, extras: [] }]));
    abrir("/");
    expect(screen.queryByRole("link", { name: /Ver pedido/ })).toBeNull();
  });

  it("macaxeira: escolher o prato mostra os 5 salgados (Arriégua agora é de carne suína)", async () => {
    const u = userEvent.setup();
    abrir("/");
    expect(screen.queryByRole("link", { name: "Aprumada" })).toBeNull();
    await u.click(screen.getByRole("button", { name: "Macaxeira" }));
    expect(local()).toBe("/?prato=macaxeira");
    for (const n of ["Aprumada", "Fulô de Mandacaru", "Quintura", "Arriégua", "Da Terra"]) {
      expect(screen.getByRole("link", { name: n })).toBeTruthy();
    }
    expect(screen.getByText("Carne suína em cubos acebolada")).toBeTruthy();
    expect(screen.queryByText(/carne moída bem soltinha e molhadinha/i)).toBeNull();
    expect(screen.queryAllByRole("img", { name: /em breve/ })).toHaveLength(0); // todos têm foto
    await u.click(screen.getByRole("tab", { name: "Doces" }));
    expect(screen.getByRole("link", { name: "Luar do Sertão" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Xodózin" })).toBeTruthy();
    await u.click(screen.getByRole("button", { name: "Bebidas" }));
    expect(local()).toBe("/?prato=bebidas");
    expect(screen.queryByRole("tablist")).toBeNull(); // bebidas: sem abas, com todos os produtos
    expect(screen.getByRole("link", { name: "Coca-Cola 350 ml" })).toBeTruthy();
  });

  it("macaxeira salgada pede acompanhamento e entra no pedido com o nome completo", async () => {
    const u = userEvent.setup();
    abrir("/cardapio/macaxeira-frango");
    await u.click(screen.getByRole("radio", { name: "Vinagrete da casa" }));
    await u.click(screen.getByRole("button", { name: /Adicionar · / }));
    expect(local()).toBe("/?prato=bebidas");
    expect(JSON.parse(localStorage.getItem("cuscuz-pedido-v3") ?? "[]")[0]).toMatchObject({ id: "macaxeira-frango", acomp: "vinagrete" });
  });

  it("três botões no topo; Cuscuz e Macaxeira têm as abas Todos, Salgados e Doces", async () => {
    const u = userEvent.setup();
    abrir("/");
    const botoes = screen.getByRole("group", { name: "Escolha o que pedir" });
    expect(within(botoes).getAllByRole("button").map((b) => b.textContent)).toEqual(["Cuscuz", "Macaxeira", "Bebidas"]);
    expect(within(botoes).getByRole("button", { name: "Cuscuz" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getAllByRole("tab").map((a) => a.textContent)).toEqual(["Todos", "Salgados", "Doces"]);
    expect(screen.getByRole("tab", { name: "Todos", selected: true })).toBeTruthy(); // abre em "Todos"
    expect(screen.getByRole("heading", { level: 3, name: "6 Opções" })).toBeTruthy(); // 4 salgados + 2 doces

    await u.click(screen.getByRole("tab", { name: "Salgados" }));
    expect(screen.getByRole("heading", { level: 3, name: "4 Opções" })).toBeTruthy();
    await u.click(screen.getByRole("tab", { name: "Doces" }));
    expect(screen.getByRole("heading", { level: 3, name: "2 Opções" })).toBeTruthy();

    await u.click(screen.getByRole("button", { name: "Macaxeira" }));
    expect(screen.getByRole("tab", { name: "Doces", selected: true })).toBeTruthy(); // a aba escolhida continua
    expect(screen.getByRole("link", { name: "Luar do Sertão" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Cartola" })).toBeNull();
  });

  it("Bebidas mostra os 4 produtos sem abas, e o endereço antigo (?categoria=bebidas) continua valendo", () => {
    abrir("/?prato=bebidas");
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "4 Opções" })).toBeTruthy();
    cleanup();
    abrir("/?categoria=bebidas");
    expect(screen.getByRole("button", { name: "Bebidas" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("heading", { level: 3, name: "4 Opções" })).toBeTruthy();
  });

  it("'Sem acompanhamento' é uma escolha válida: deixa seguir e aparece assim no pedido", async () => {
    const u = userEvent.setup();
    abrir("/cardapio/carne-de-sol");
    const radios = (screen.getAllByRole("radio") as HTMLInputElement[]).filter((r) => r.name === "acompanhamento");
    expect(radios).toHaveLength(3);
    await u.click(screen.getByRole("radio", { name: "Sem acompanhamento" }));
    await u.click(screen.getByRole("button", { name: /Adicionar · / }));
    expect(local()).toBe("/?prato=bebidas");
    expect(JSON.parse(localStorage.getItem("cuscuz-pedido-v3") ?? "[]")[0]).toMatchObject({ id: "carne-de-sol", acomp: "sem-acompanhamento" });

    cleanup();
    abrir("/pedido");
    expect(screen.getByText("Sem acompanhamento")).toBeTruthy();
    expect(screen.queryByText(/^Acompanhamento:/)).toBeNull();
  });
});
