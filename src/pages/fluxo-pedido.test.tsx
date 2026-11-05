// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider } from "../context/CartContext";
import Finalizar from "./Finalizar";
import Pedido from "./Pedido";
import PedidoEnviado from "./PedidoEnviado";

const viaCep = vi.fn(async () => ({
  ok: true,
  json: async () => ({ logradouro: "Rua Exemplo", bairro: "Serraria", localidade: "Maceió", uf: "AL" }),
}));

function abrir() {
  localStorage.setItem("cuscuz-pedido-v3", JSON.stringify([
    { id: "carne-de-sol", qtd: 1, extras: ["queijo-coalho"], acomp: "vinagrete" },
    { id: "coca-cola", qtd: 1, extras: [], acomp: null },
  ]));
  render(
    <MemoryRouter initialEntries={["/pedido"]}>
      <CartProvider>
        <Routes>
          <Route path="/pedido" element={<Pedido />} />
          <Route path="/pedido/finalizar" element={<Finalizar />} />
          <Route path="/pedido/enviado" element={<PedidoEnviado />} />
          <Route path="/" element={<h1>início</h1>} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  );
}

// Relógio fixo: 15:00 em Maceió (antes do limite de 16h), para os testes não dependerem da hora em que rodam.
beforeAll(() => { vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(new Date("2026-11-03T18:00:00Z")); });

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); vi.stubGlobal("fetch", viaCep); viaCep.mockClear(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.setSystemTime(new Date("2026-11-03T18:00:00Z")); });

describe("fluxo Seu pedido → Falta só um passo", () => {
  it("conclui um pedido em dinheiro com troco e monta a comanda", async () => {
    const u = userEvent.setup();
    abrir();
    expect(screen.getAllByText(/22,98/).length).toBeGreaterThan(0);

    await u.type(screen.getByLabelText("Nome*"), "Rodolpho");
    await u.type(screen.getByLabelText("Telefone / WhatsApp*"), "82994336126");
    await u.type(screen.getByLabelText("CEP*"), "57046000"); // busca sozinho ao completar 8 dígitos

    await waitFor(() => expect(screen.getByLabelText("Rua / Condomínio / Residencial*")).toHaveProperty("value", "Rua Exemplo"));
    expect(viaCep).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Bairro*")).toHaveProperty("value", "Serraria");
    expect(screen.getByLabelText("UF*")).toHaveProperty("value", "AL");
    expect(document.activeElement).toBe(screen.getByLabelText("Número*")); // foco vai direto ao número

    await u.type(screen.getByLabelText("Número*"), "120");
    await u.type(screen.getByLabelText("Complemento (bloco e apto)*"), "Bloco B, apto 302");
    await u.click(screen.getByRole("radio", { name: "18h às 19h" }));
    await u.click(screen.getByRole("radio", { name: "Dinheiro" }));
    await u.type(screen.getByLabelText("Troco para quanto?"), "50");
    await u.click(screen.getByRole("button", { name: /Finalizar pedido/ }));

    expect(await screen.findByRole("heading", { name: "Falta só um passo" })).toBeTruthy();
    const link = screen.getByRole("link", { name: /Enviar comanda para o WhatsApp/ }) as HTMLAnchorElement;
    expect(link.href.startsWith("https://wa.me/5582994336126?text=")).toBe(true);
    expect(link.rel).toContain("noopener");
    const texto = decodeURIComponent(link.href.split("text=")[1]);
    expect(texto).toContain("Rua Exemplo, 120 - Serraria");
    expect(texto).toContain("```1x Do Sertão ..");
    expect(texto).toContain("*ENTREGA*\nHorário: hoje, 18h às 19h");
    expect(texto).toContain("   Acomp.: Vinagrete da casa\n   + Queijo coalho");
    expect(texto).toContain("*TOTAL:* R$ 22,98");
    expect(texto).toContain("Troco para: R$ 50,00 (levar R$ 27,02)");
    expect(texto).toMatch(/Pedido #\d{4} · /);

    // sem bloco de resumo separado: só a comanda, com os títulos em negrito
    expect(screen.queryByText("Prévia da comanda")).toBeNull();
    expect(screen.queryByText("Endereço")).toBeNull();
    const previa = screen.getByRole("group", { name: "Resumo" });
    expect(previa.textContent).toContain("Troco para: R$ 50,00 (levar R$ 27,02)");
    expect(previa.querySelector("strong")?.textContent).toBe("COMANDA · CUSCUZ DE CASA");
    expect(previa.querySelector(".previa__mono")?.textContent).toContain("Acomp.: Vinagrete da casa"); // itens em bloco monoespaçado
    expect(previa.textContent).not.toContain("```"); // as crases não aparecem na prévia

    // enviar: abre o WhatsApp (outra aba) e esta aba vai para o agradecimento, sem voltar ao carrinho
    await u.click(link);
    expect(await screen.findByRole("heading", { name: "Obrigado pelo seu pedido!" }, { timeout: 2000 })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Voltar para o início" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "Enviar a comanda de novo" })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("cuscuz-pedido-v3") ?? "[]")).toEqual([]); // carrinho esvaziado
    expect(sessionStorage.getItem("cuscuz-rascunho-v1")).toBeNull();
  });

  it("não avança com campos em branco e mostra os erros", async () => {
    const u = userEvent.setup();
    abrir();
    await u.click(screen.getByRole("button", { name: /Finalizar pedido/ }));
    expect(screen.getByRole("alert").textContent).toContain("Revise os campos");
    expect(screen.getByText("Informe seu nome.")).toBeTruthy();
    expect(screen.getByText("Escolha a forma de pagamento.")).toBeTruthy();
    expect(screen.getByText("Escolha o horário de entrega.")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Falta só um passo" })).toBeNull();
    expect(document.activeElement).toBe(screen.getByLabelText("Nome*"));
  });

  it("depois das 16h os pedidos de hoje estão encerrados: aviso e botão desativado", () => {
    vi.setSystemTime(new Date("2026-11-03T20:00:00Z")); // 17:00 em Maceió
    abrir();
    expect(screen.getByText(/Os pedidos de hoje encerraram às 16h/)).toBeTruthy();
    expect((screen.getByRole("button", { name: /Finalizar pedido/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("CEP que falha não trava: avisa e deixa preencher à mão", async () => {
    viaCep.mockRejectedValueOnce(new Error("rede"));
    const u = userEvent.setup();
    abrir();
    await u.type(screen.getByLabelText("CEP*"), "57046000");
    expect(await screen.findByText(/Não foi possível buscar o CEP/)).toBeTruthy();
    await u.type(screen.getByLabelText("Rua / Condomínio / Residencial*"), "Rua Manual");
    expect(screen.getByLabelText("Rua / Condomínio / Residencial*")).toHaveProperty("value", "Rua Manual");
  });

  it("abrir /pedido/finalizar sem dados volta ao carrinho", async () => {
    localStorage.setItem("cuscuz-pedido-v3", JSON.stringify([{ id: "coca-cola", qtd: 1, extras: [], acomp: null }]));
    render(
      <MemoryRouter initialEntries={["/pedido/finalizar"]}>
        <CartProvider>
          <Routes>
            <Route path="/pedido" element={<h1>carrinho</h1>} />
            <Route path="/pedido/finalizar" element={<Finalizar />} />
          </Routes>
        </CartProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { name: "carrinho" })).toBeTruthy();
  });
});
