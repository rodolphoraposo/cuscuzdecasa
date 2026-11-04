// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import App from "../App";
import { CartProvider } from "../context/CartContext";

beforeAll(() => { window.scrollTo = vi.fn() as unknown as typeof window.scrollTo; });
afterEach(cleanup);

describe("Home", () => {
  it("a frase de chamada explica o funcionamento logo no topo, junto dos horários", () => {
    render(<MemoryRouter><CartProvider><App /></CartProvider></MemoryRouter>);
    const hero = screen.getByRole("heading", { level: 1 }).closest(".hero__texto") as HTMLElement;
    expect(hero.textContent).toContain("Faça seu pedido de dia e receba à noite!");
    expect(hero.textContent).toContain("Pedidos até as 16h · entrega das 17h às 22h");
    expect(within(hero).getByRole("link", { name: "Peça agora!" }).getAttribute("href")).toBe("/cardapio");
  });
});
