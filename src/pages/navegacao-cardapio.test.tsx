// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import App from "../App";
import { CartProvider } from "../context/CartContext";

const Local = () => { const l = useLocation(); return <output data-testid="local">{l.pathname + l.search + l.hash}</output>; };
const abrir = (rota: string) =>
  render(<MemoryRouter initialEntries={[rota]}><CartProvider><App /><Local /></CartProvider></MemoryRouter>);
const local = () => screen.getByTestId("local").textContent;

beforeAll(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-03T18:00:00Z"));
});
afterEach(() => { cleanup(); localStorage.clear(); });

describe("navegação do cardápio (seção #cardapio da Home)", () => {
  it("o link antigo /cardapio leva à Home, mantendo categoria e vista", () => {
    abrir("/cardapio?categoria=doces&vista=grade");
    expect(local()).toBe("/?categoria=doces&vista=grade#cardapio");
    expect(screen.getByRole("tab", { name: "Doces", selected: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ver em grade" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("o cardápio completo está na Home, sem o botão 'Ver cardápio completo e pedir'", () => {
    abrir("/");
    const secao = document.getElementById("cardapio") as HTMLElement;
    expect(secao).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Cardápio" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 3, name: "6 Opções" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Ver cardápio completo/ })).toBeNull();
  });

  it("lista/grade e abas não criam histórico: o voltar do navegador continua levando à origem", async () => {
    const u = userEvent.setup();
    abrir("/");
    await u.click(screen.getByRole("button", { name: "Ver em grade" }));
    await u.click(screen.getByRole("tab", { name: "Doces" }));
    expect(local()).toBe("/?vista=grade&categoria=doces");
  });

  it("trocar de aba mantém a âncora e não rola a página para o topo", async () => {
    const u = userEvent.setup();
    abrir("/#cardapio");
    vi.mocked(window.scrollTo).mockClear();
    await u.click(screen.getByRole("tab", { name: "Doces" }));
    await u.click(screen.getByRole("button", { name: "Macaxeira" }));
    expect(local()).toBe("/?categoria=doces&prato=macaxeira#cardapio");
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("todos os 'Peça agora' levam à seção Cardápio da Home", () => {
    abrir("/");
    const botoes = screen.getAllByRole("link", { name: "Peça agora!" });
    expect(botoes.length).toBeGreaterThanOrEqual(2); // cabeçalho e topo da Home
    for (const b of botoes) expect(b.getAttribute("href")).toBe("/#cardapio");
  });

  it("ao voltar de um item, a grade e a categoria escolhidas são mantidas e a tela volta ao cardápio", async () => {
    const u = userEvent.setup();
    abrir("/?categoria=doces&vista=grade");
    await u.click(screen.getAllByRole("link", { name: /\S/ }).find((a) => a.getAttribute("href")?.startsWith("/cardapio/"))!);
    expect(local()).toMatch(/^\/cardapio\/[^?#]+$/);
    await u.click(screen.getByRole("link", { name: "Voltar ao cardápio" }));
    expect(local()).toBe("/?categoria=doces&vista=grade#cardapio");
  });

  it("origem forjada no state não redireciona para fora do site", async () => {
    const u = userEvent.setup();
    render(
      <MemoryRouter initialEntries={[{ pathname: "/cardapio/carne-de-sol", state: { voltar: "//evil.com" } }]}>
        <CartProvider><App /><Local /></CartProvider>
      </MemoryRouter>,
    );
    await u.click(screen.getByRole("link", { name: "Voltar ao cardápio" }));
    expect(local()).toBe("/?prato=cuscuz&categoria=salgados#cardapio");
  });
});
