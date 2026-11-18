// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import App from "../App";
import { CartProvider } from "../context/CartContext";

beforeAll(() => { window.scrollTo = vi.fn() as unknown as typeof window.scrollTo; });
afterEach(cleanup);
const abrir = () => render(<MemoryRouter><CartProvider><App /></CartProvider></MemoryRouter>);

describe("Contato oficial no rodapé", () => {
  it("mostra o número oficial, os dias de funcionamento e o Instagram", () => {
    abrir();
    const rodape = within(screen.getByRole("contentinfo"));
    const zap = rodape.getByRole("link", { name: "(82) 99152-0132" }) as HTMLAnchorElement;
    expect(zap.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/5582991520132\?text=/);
    expect(decodeURIComponent(zap.href.split("text=")[1])).toMatch(/^Olá! Vim pelo cardápio digital/); // abre com mensagem pronta
    expect(zap.querySelector("svg")).toBeTruthy(); // ícone do WhatsApp
    expect(rodape.getByRole("link", { name: /@cuscuzdecasaoficial/ }).querySelector("svg")).toBeTruthy(); // ícone do Instagram
    expect(rodape.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Navegue", "Fale com a gente"]); // duas colunas
    expect(rodape.getByText("Funcionamos de segunda a sexta")).toBeTruthy();
    expect(rodape.getByRole("link", { name: "Combos" }).getAttribute("href")).toBe("/?prato=combos#cardapio");
  });
});

describe("Instagram da casa", () => {
  it("rodapé tem o link para o perfil, em nova aba e sem vazar a página de origem", () => {
    abrir();
    const link = within(screen.getByRole("contentinfo")).getByRole("link", { name: /@cuscuzdecasaoficial/ }) as HTMLAnchorElement;
    expect(link.href).toBe("https://www.instagram.com/cuscuzdecasaoficial/");
    expect(link.target).toBe("_blank");
    expect(link.rel).toContain("noopener");
    expect(link.textContent).toContain("@cuscuzdecasaoficial"); // o texto visível está no nome acessível
  });

  it("menu do celular também leva ao Instagram", async () => {
    const u = userEvent.setup();
    abrir();
    await u.click(screen.getByRole("button", { name: "Abrir menu" }));
    const link = within(screen.getByRole("navigation", { name: "Menu" })).getByRole("link", { name: /Instagram/ }) as HTMLAnchorElement;
    expect(link.href).toBe("https://www.instagram.com/cuscuzdecasaoficial/");
    expect(link.rel).toContain("noopener");
  });
});
