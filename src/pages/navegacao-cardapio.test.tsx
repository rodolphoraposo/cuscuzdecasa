// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
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

describe("navegação do cardápio", () => {
  it("voltar do Cardápio vai para o início, mesmo abrindo o link direto", async () => {
    const u = userEvent.setup();
    abrir("/cardapio?categoria=doces");
    await u.click(screen.getByRole("link", { name: "Voltar ao início" }));
    expect(local()).toBe("/");
  });

  it("lista/grade e abas não criam histórico: o voltar do navegador continua levando à origem", async () => {
    const u = userEvent.setup();
    abrir("/cardapio");
    await u.click(screen.getByRole("button", { name: "Ver em grade" }));
    await u.click(screen.getByRole("tab", { name: "Doces" }));
    expect(local()).toBe("/cardapio?vista=grade&categoria=doces");
  });

  it("ao voltar de um item, a grade e a categoria escolhidas são mantidas", async () => {
    const u = userEvent.setup();
    abrir("/cardapio?categoria=doces&vista=grade");
    await u.click(screen.getAllByRole("link", { name: /\S/ }).find((a) => a.getAttribute("href")?.startsWith("/cardapio/"))!);
    expect(local()).toMatch(/^\/cardapio\/[^?]+$/);
    await u.click(screen.getByRole("link", { name: "Voltar ao cardápio" }));
    expect(local()).toBe("/cardapio?categoria=doces&vista=grade");
  });

  it("origem forjada no state não redireciona para fora do site", async () => {
    const u = userEvent.setup();
    render(
      <MemoryRouter initialEntries={[{ pathname: "/cardapio/carne-de-sol", state: { voltar: "//evil.com" } }]}>
        <CartProvider><App /><Local /></CartProvider>
      </MemoryRouter>,
    );
    await u.click(screen.getByRole("link", { name: "Voltar ao cardápio" }));
    expect(local()).toBe("/cardapio?categoria=salgados");
  });
});
