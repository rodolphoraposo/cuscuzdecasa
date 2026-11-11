// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import App from "../App";
import DesignSystem from "./DesignSystem";
import { Select, Textarea } from "../components/ui";
import { CartProvider } from "../context/CartContext";

const Local = () => { const l = useLocation(); return <output data-testid="local">{l.pathname + l.search}</output>; };
const abrir = (rota: string) =>
  render(<MemoryRouter initialEntries={[rota]}><CartProvider><App /><Local /></CartProvider></MemoryRouter>);

beforeAll(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-03T18:00:00Z"));
});
afterEach(() => { cleanup(); localStorage.clear(); });

describe("teclado nas abas do cardápio", () => {
  it("só a aba atual entra no Tab; setas, Home e End trocam de aba e levam o foco", async () => {
    const u = userEvent.setup();
    abrir("/");
    const abas = () => screen.getAllByRole("tab");
    expect(abas().map((a) => a.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);

    abas()[0].focus();
    await u.keyboard("{ArrowRight}");
    expect(await screen.findByRole("tab", { name: "Salgados", selected: true })).toBe(document.activeElement);
    await u.keyboard("{End}");
    expect(await screen.findByRole("tab", { name: "Doces", selected: true })).toBe(document.activeElement);
    await u.keyboard("{ArrowRight}"); // dá a volta
    expect(await screen.findByRole("tab", { name: "Todos", selected: true })).toBe(document.activeElement);
    await u.keyboard("{ArrowLeft}");
    expect(await screen.findByRole("tab", { name: "Doces", selected: true })).toBe(document.activeElement);
    await u.keyboard("{Home}");
    expect(await screen.findByRole("tab", { name: "Todos", selected: true })).toBe(document.activeElement);
  });
});

describe("estrutura das páginas", () => {
  it("telas vazias de página inteira têm o seu h1", () => {
    abrir("/nao-existe");
    expect(screen.getByRole("heading", { level: 1, name: "Página não encontrada" })).toBeTruthy();
    cleanup();
    abrir("/cardapio/nao-existe");
    expect(screen.getByRole("heading", { level: 1, name: "Item não encontrado" })).toBeTruthy();
    cleanup();
    abrir("/pedido"); // carrinho vazio
    expect(screen.getByRole("heading", { level: 1, name: "Seu pedido está vazio" })).toBeTruthy();
  });

  it("cada página tem um título próprio", () => {
    abrir("/cardapio/carne-de-sol");
    expect(document.title).toBe("Do Sertão · Cuscuz de Casa");
  });

  it("páginas de pedido e 404 pedem aos buscadores para não indexar; a Home não", () => {
    const robots = () => document.head.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null;
    abrir("/");
    expect(robots()).toBeNull();
    cleanup();
    abrir("/pedido");
    expect(robots()).toBe("noindex");
    cleanup();
    expect(robots()).toBeNull(); // sai da página, sai a marcação
    abrir("/nao-existe");
    expect(robots()).toBe("noindex");
  });
});

describe("componentes do Design System", () => {
  it("associa a legenda aos campos Select e Textarea", () => {
    render(
      <>
        <Select rotulo="Categoria" legenda="Escolha uma categoria">
          <option value="salgados">Salgados</option>
        </Select>
        <Textarea rotulo="Observações" legenda="Até 200 caracteres" />
      </>,
    );

    for (const [rotulo, legenda] of [
      ["Categoria", "Escolha uma categoria"],
      ["Observações", "Até 200 caracteres"],
    ]) {
      const campo = screen.getByLabelText(rotulo);
      const idLegenda = campo.getAttribute("aria-describedby");
      expect(idLegenda).toBeTruthy();
      expect(document.getElementById(idLegenda!)?.textContent).toBe(legenda);
    }
  });

  it("as abas da referência visual seguem o padrão de teclado e painel", async () => {
    const u = userEvent.setup();
    render(<DesignSystem />);
    const abas = () => screen.getAllByRole("tab");
    expect(abas().map((aba) => aba.getAttribute("tabindex"))).toEqual(["0", "-1", "-1", "-1"]);

    abas()[0].focus();
    await u.keyboard("{ArrowRight}");
    const selecionada = await screen.findByRole("tab", { name: "Detalhes", selected: true });
    await waitFor(() => expect(selecionada).toBe(document.activeElement));
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe(selecionada.id);
  });
});

describe("desfazer remoção no carrinho", () => {
  it("remover o último item mostra o aviso e o botão Desfazer devolve o item", async () => {
    const u = userEvent.setup();
    localStorage.setItem("cuscuz-pedido-v3", JSON.stringify([{ id: "coca-cola", qtd: 1, extras: [], acomp: null }]));
    abrir("/pedido");
    await u.click(screen.getByRole("button", { name: "Remover Coca-Cola 350 ml do pedido" }));
    expect(screen.getByRole("heading", { level: 1, name: "Seu pedido está vazio" })).toBeTruthy();
    expect(screen.getByText("Coca-Cola 350 ml foi removido do pedido.").closest("[role=status]")).toBeTruthy(); // anunciado por leitores de tela

    await u.click(screen.getByRole("button", { name: "Desfazer" }));
    expect(screen.queryByRole("heading", { name: "Seu pedido está vazio" })).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "Coca-Cola 350 ml" })).toBeTruthy();
  });

  it("com dois itens, o aviso aparece junto da lista e Desfazer restaura adicionais e acompanhamento", async () => {
    const u = userEvent.setup();
    localStorage.setItem("cuscuz-pedido-v3", JSON.stringify([
      { id: "carne-de-sol", qtd: 1, extras: ["queijo-coalho"], acomp: "refogado" },
      { id: "coca-cola", qtd: 1, extras: [], acomp: null },
    ]));
    abrir("/pedido");
    await u.click(screen.getByRole("button", { name: "Remover Do Sertão (cuscuz) do pedido" }));
    expect(screen.queryByText("Acompanhamento: Refogado especial da casa")).toBeNull();
    await u.click(screen.getByRole("button", { name: "Desfazer" }));
    expect(screen.getByText("Acompanhamento: Refogado especial da casa")).toBeTruthy();
    expect(screen.getByText("+ Queijo coalho")).toBeTruthy();
  });
});
