// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import App from "../App";
import { CartProvider } from "../context/CartContext";

const abrir = (rota: string) =>
  render(<MemoryRouter initialEntries={[rota]}><CartProvider><App /></CartProvider></MemoryRouter>);
beforeAll(() => { window.scrollTo = vi.fn() as unknown as typeof window.scrollTo; }); // jsdom não implementa
afterEach(cleanup);

describe("páginas legais e 404", () => {
  it("Termos de Uso mostra horários, área de entrega e alergias a partir dos dados reais", () => {
    abrir("/termos");
    expect(screen.getByRole("heading", { level: 1, name: "Termos de Uso" })).toBeTruthy();
    expect(document.body.textContent).toContain("até as 16h");
    expect(document.body.textContent).toContain("17h às 22h");
    expect(document.body.textContent).toContain("Sierra Park");
    expect(document.body.textContent).toContain("queijo coalho, mussarela, requeijão");
    expect(document.body.textContent).not.toContain("Conteúdo em preparação");
  });
  it("Política de Privacidade cita os terceiros que realmente recebem dados", () => {
    abrir("/privacidade");
    expect(screen.getByRole("heading", { level: 1, name: "Política de Privacidade" })).toBeTruthy();
    for (const t of ["WhatsApp", "ViaCEP", "Vercel", "LGPD"]) expect(document.body.textContent).toContain(t);
  });
  it("endereço inexistente mostra 404 com saída, e o link de pular conteúdo existe", () => {
    abrir("/nao-existe");
    expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ver cardápio" }).getAttribute("href")).toBe("/cardapio");
    expect(screen.getByRole("link", { name: "Ir para o início" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "Pular para o conteúdo" }).getAttribute("href")).toBe("#conteudo");
  });
});
