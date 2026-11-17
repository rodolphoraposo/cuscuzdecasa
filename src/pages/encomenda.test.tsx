// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { CartProvider } from "../context/CartContext";
import * as analytics from "../lib/analytics";

const abrir = () => render(<MemoryRouter initialEntries={["/encomenda"]}><CartProvider><App /></CartProvider></MemoryRouter>);

beforeAll(() => { window.scrollTo = vi.fn() as unknown as typeof window.scrollTo; vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(new Date("2026-11-17T18:00:00Z")); });
beforeEach(() => vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ logradouro: "Rua Exemplo", bairro: "Serraria", localidade: "Maceió", uf: "AL" }) }))));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

async function preencherBasico(u: ReturnType<typeof userEvent.setup>) {
  await u.selectOptions(screen.getByLabelText("Item 1"), "frango-desfiado");
  await u.clear(screen.getByLabelText("Quantidade")); await u.type(screen.getByLabelText("Quantidade"), "30");
  await u.type(screen.getByLabelText("Data*"), "2026-11-20");
  await u.selectOptions(screen.getByLabelText("Horário*"), "noite");
  await u.type(screen.getByLabelText("Nome*"), "Rodolpho");
  await u.type(screen.getByLabelText("Telefone / WhatsApp*"), "82994336126");
}

describe("Encomendas", () => {
  it("enviar vazio mostra os erros e leva o foco ao primeiro campo com problema", async () => {
    const u = userEvent.setup();
    abrir();
    await u.click(screen.getByRole("button", { name: "Revisar encomenda" }));
    expect(screen.getByRole("alert").textContent).toMatch(/pelo menos um item/);
    expect(document.activeElement).toBe(screen.getByLabelText("Item 1"));
    expect(screen.queryByRole("heading", { name: "Confira sua encomenda" })).toBeNull();
  });

  it("retirada completa: revisa a mensagem e abre o WhatsApp com ela; só registra um lead sem dados pessoais", async () => {
    const eventos = vi.spyOn(analytics, "registrarEvento").mockImplementation(() => {});
    const u = userEvent.setup();
    abrir();
    await preencherBasico(u);
    await u.click(screen.getByRole("radio", { name: "Retirada na casa" }));
    expect(screen.queryByLabelText("CEP*")).toBeNull();
    await u.click(screen.getByRole("button", { name: "Revisar encomenda" }));

    expect(await screen.findByRole("heading", { name: "Confira sua encomenda" })).toBeTruthy();
    const link = screen.getByRole("link", { name: /Enviar encomenda no WhatsApp/ }) as HTMLAnchorElement;
    expect(link.href).toMatch(/^https:\/\/wa\.me\/55829\d+\?text=/);
    const texto = decodeURIComponent(link.href.split("text=")[1]);
    expect(texto).toContain("*Nome:* Rodolpho");
    expect(texto).toContain("• 30× Asa Branca");
    expect(texto).toContain("*Para:* sexta-feira, 20/11/2026");
    expect(link.target).toBe("_blank");
    expect(eventos).toHaveBeenCalledWith("generate_lead", { origem: "encomenda" });
    expect(JSON.stringify(eventos.mock.calls)).not.toMatch(/Rodolpho|99433|Asa Branca/);
  });

  it("entrega: o CEP preenche o endereço e a mensagem leva o endereço; dá para voltar e editar", async () => {
    const u = userEvent.setup();
    abrir();
    await preencherBasico(u);
    await u.type(screen.getByLabelText("CEP*"), "57046000");
    expect(await screen.findByDisplayValue("Rua Exemplo")).toBeTruthy();
    await u.type(screen.getByLabelText("Número*"), "120");
    await u.click(screen.getByRole("button", { name: "Revisar encomenda" }));
    const previa = await screen.findByRole("group", { name: "Confira sua encomenda" });
    expect(previa.textContent).toContain("Rua Exemplo, 120");

    await u.click(screen.getByRole("button", { name: "Voltar e editar" }));
    expect((screen.getByLabelText("Nome*") as HTMLInputElement).value).toBe("Rodolpho"); // nada se perdeu
  });

  it("vários itens: adiciona e remove linhas, e a mensagem lista todos", async () => {
    const u = userEvent.setup();
    abrir();
    await preencherBasico(u);
    await u.click(screen.getByRole("radio", { name: "Retirada na casa" }));
    await u.click(screen.getByRole("button", { name: "Adicionar outro item" }));
    await u.selectOptions(screen.getByLabelText("Item 2"), "carne-de-sol");
    await u.click(screen.getByRole("button", { name: "Adicionar outro item" }));
    await u.click(screen.getByRole("button", { name: "Remover o item 3" }));
    expect(screen.queryByLabelText("Item 3")).toBeNull();
    await u.click(screen.getByRole("button", { name: "Revisar encomenda" }));
    const previa = await screen.findByRole("group", { name: "Confira sua encomenda" });
    expect(within(previa).getByText(/30× Asa Branca/)).toBeTruthy();
    expect(within(previa).getByText(/1× Do Sertão/)).toBeTruthy();
  });

  it("a Home e o menu levam à página de encomendas", () => {
    render(<MemoryRouter initialEntries={["/"]}><CartProvider><App /></CartProvider></MemoryRouter>);
    expect(screen.getAllByRole("link", { name: /Encomendas|Fazer uma encomenda/ }).every((a) => (a as HTMLAnchorElement).getAttribute("href") === "/encomenda")).toBe(true);
  });
});
