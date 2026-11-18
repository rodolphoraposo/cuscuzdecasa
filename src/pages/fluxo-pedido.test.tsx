// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider } from "../context/CartContext";
import * as analytics from "../lib/analytics";
import { limparCacheDeCoordenadas } from "../lib/geocep";
import Finalizar from "./Finalizar";
import Pedido from "./Pedido";
import PedidoEnviado from "./PedidoEnviado";

// Serviços externos simulados: ViaCEP (endereço) e BrasilAPI (coordenadas do CEP). Os testes escolhem a distância do cliente.
const ORIGEM = { lat: -9.58, lng: -35.76 };
let distanciaDoCliente: number | null = 0.8; // km ao norte da origem; null = BrasilAPI fora do ar
let viaCepFalha = false;
const servicos = vi.fn(async (url: RequestInfo | URL) => {
  const u = String(url);
  if (u.includes("/api/feriados")) return { ok: true, json: async () => ({ feriados: [] }) };
  if (u.includes("supabase.co")) return { ok: true, status: 201, json: async () => null }; // Operatta: número provisório, sem ruído
  if (u.includes("viacep.com.br")) {
    if (viaCepFalha) throw new Error("rede");
    return { ok: true, json: async () => ({ logradouro: "Rua Exemplo", bairro: "Serraria", localidade: "Maceió", uf: "AL" }) };
  }
  if (u.includes("brasilapi.com.br")) {
    if (distanciaDoCliente === null) throw new Error("rede");
    const origem = u.endsWith("/57046350");
    const lat = origem ? ORIGEM.lat : ORIGEM.lat + distanciaDoCliente / 111.19;
    return { ok: true, status: 200, json: async () => ({ location: { coordinates: { latitude: String(lat), longitude: String(ORIGEM.lng) } } }) };
  }
  throw new Error(`endereço inesperado nos testes: ${u}`);
});
const servicosPadrao = servicos.getMockImplementation();
const chamadasA = (parte: string) => servicos.mock.calls.filter((c) => String(c[0]).includes(parte)).length;

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

beforeEach(() => {
  localStorage.clear(); sessionStorage.clear(); limparCacheDeCoordenadas();
  distanciaDoCliente = 0.8; viaCepFalha = false;
  vi.stubGlobal("fetch", servicos); servicos.mockClear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  if (servicosPadrao) servicos.mockImplementation(servicosPadrao);
  vi.setSystemTime(new Date("2026-11-03T18:00:00Z"));
});

describe("fluxo Seu pedido → Falta só um passo", () => {
  it("conclui um pedido em dinheiro com troco e monta a comanda", async () => {
    const u = userEvent.setup();
    const eventos = vi.spyOn(analytics, "registrarEvento").mockImplementation(() => {});
    const de = (nome: string) => eventos.mock.calls.filter((c) => c[0] === nome).map((c) => c[1] as Record<string, any>);
    abrir();
    expect(screen.getAllByText(/21,99/).length).toBeGreaterThan(0);
    expect(de("view_cart")).toEqual([expect.objectContaining({ currency: "BRL", value: 27.98 })]);

    await u.type(screen.getByLabelText("Nome*"), "Rodolpho");
    await u.type(screen.getByLabelText("Telefone / WhatsApp*"), "82994336126");
    await u.type(screen.getByLabelText("CEP*"), "57046000"); // busca sozinho ao completar 8 dígitos

    await waitFor(() => expect(screen.getByLabelText("Rua / Condomínio / Residencial*")).toHaveProperty("value", "Rua Exemplo"));
    expect(chamadasA("viacep")).toBe(1);
    expect(await screen.findByText(/Taxa de entrega:/)).toBeTruthy(); // a taxa é calculada junto com o endereço
    expect(screen.getByLabelText("Bairro*")).toHaveProperty("value", "Serraria");
    expect(screen.getByLabelText("UF*")).toHaveProperty("value", "AL");
    expect(document.activeElement).toBe(screen.getByLabelText("Número*")); // foco vai direto ao número

    await u.type(screen.getByLabelText("Número*"), "120");
    await u.type(screen.getByLabelText("Complemento (bloco e apto)*"), "Bloco B, apto 302");
    await u.click(screen.getByRole("radio", { name: /18h às 19h/ }));
    await u.click(screen.getByRole("radio", { name: "Dinheiro" }));
    await u.type(screen.getByLabelText("Troco para quanto?"), "50");
    await u.click(screen.getByRole("button", { name: /Finalizar pedido/ }));

    expect(await screen.findByRole("heading", { name: "Falta só um passo" })).toBeTruthy();
    expect(de("begin_checkout")).toEqual([expect.objectContaining({ currency: "BRL", value: 31.98, shipping: 4 })]);
    expect(de("purchase")).toHaveLength(0); // só conta quando a comanda é enviada
    const link = screen.getByRole("link", { name: /Enviar comanda para o WhatsApp/ }) as HTMLAnchorElement;
    expect(link.href.startsWith("https://wa.me/5582991520132?text=")).toBe(true); // número oficial da casa
    expect(link.rel).toContain("noopener");
    const texto = decodeURIComponent(link.href.split("text=")[1]);
    expect(texto).toContain("Rua Exemplo, 120 - Serraria");
    expect(texto).toContain("```1x Do Sertão ..");
    expect(texto).toContain("*ENTREGA*\nHorário: hoje, 18h às 19h");
    expect(texto).toContain("   Acomp.: Vinagrete da casa\n   + Queijo coalho");
    expect(texto).toContain("*Entrega:* R$ 4,00 (cerca de 800 m)");
    expect(texto).toContain("*TOTAL:* R$ 31,98");
    expect(texto).toContain("Troco para: R$ 50,00 (levar R$ 18,02)");
    expect(texto).toMatch(/Pedido #\d{4} · /);

    // sem bloco de resumo separado: só a comanda, com os títulos em negrito
    expect(screen.queryByText("Prévia da comanda")).toBeNull();
    expect(screen.queryByText("Endereço")).toBeNull();
    const previa = screen.getByRole("group", { name: "Resumo" });
    expect(previa.textContent).toContain("Troco para: R$ 50,00 (levar R$ 18,02)");
    expect(previa.querySelector("strong")?.textContent).toBe("COMANDA · CUSCUZ DE CASA");
    expect(previa.querySelector(".previa__mono")?.textContent).toContain("Acomp.: Vinagrete da casa"); // itens em bloco monoespaçado
    expect(previa.textContent).not.toContain("```"); // as crases não aparecem na prévia

    // enviar: abre o WhatsApp (outra aba) e esta aba vai para o agradecimento, sem voltar ao carrinho
    await u.click(link);
    expect(await screen.findByRole("heading", { name: "Obrigado pelo seu pedido!" }, { timeout: 2000 })).toBeTruthy();
    const compra = de("purchase");
    expect(compra).toHaveLength(1);
    expect(compra[0]).toMatchObject({ currency: "BRL", value: 31.98, shipping: 4 });
    expect(compra[0].transaction_id).toMatch(/^#?\d+/);
    expect(compra[0].items).toHaveLength(2);
    // nada de dados pessoais no Analytics
    const tudo = JSON.stringify(eventos.mock.calls);
    for (const pii of ["Rodolpho", "82994336126", "Rua Exemplo", "57046000", "Bloco B"]) expect(tudo).not.toContain(pii);
    expect(screen.getByRole("link", { name: "Voltar para o início" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "Enviar a comanda de novo" })).toBeTruthy();
    // Carrinho e dados digitados são apagados por um efeito da tela "Obrigado", que roda logo depois de renderizar: espera, em vez de supor.
    await waitFor(() => expect(JSON.parse(localStorage.getItem("cuscuz-pedido-v3") ?? "[]")).toEqual([]));
    await waitFor(() => expect(sessionStorage.getItem("cuscuz-rascunho-v1")).toBeNull());
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

  it("às 17h, o bloco noturno está oculto e a manhã do próximo dia continua disponível", async () => {
    vi.setSystemTime(new Date("2026-11-03T20:00:00Z")); // 17:00 em Maceió
    abrir();
    expect(screen.queryByText(/Nenhum horário está disponível agora/)).toBeNull();
    expect(await screen.findByRole("radio", { name: "8h às 9h, amanhã" })).toBeTruthy();
    expect((screen.getByRole("button", { name: /Finalizar pedido/ }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("no fim de semana após as 10h permite agendar a manhã do próximo dia útil", async () => {
    vi.setSystemTime(new Date("2026-11-07T15:00:00Z")); // sábado, 12:00 em Maceió
    abrir();
    expect(await screen.findByText(/Hoje não há entregas no fim de semana\. Voltamos na segunda-feira/)).toBeTruthy();
    expect(await screen.findByRole("radio", { name: "8h às 9h, segunda-feira" })).toBeTruthy();
    expect((screen.getByRole("button", { name: /Finalizar pedido/ }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("fim de semana antes das 10h não libera as faixas agendadas", async () => {
    vi.setSystemTime(new Date("2026-11-07T10:00:00Z")); // sábado, 07:00 em Maceió
    abrir();
    expect(await screen.findByText(/Hoje não há entregas no fim de semana\. Voltamos na segunda-feira/)).toBeTruthy();
    expect(screen.queryByRole("radio", { name: /8h às 9h/ })).toBeNull();
    expect((screen.getByRole("button", { name: /Finalizar pedido/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("não libera o pedido se não conseguir consultar o calendário de feriados", async () => {
    const fetchOriginal = servicos.getMockImplementation();
    servicos.mockImplementation(async (url) => {
      if (String(url).includes("/api/feriados")) throw new Error("offline");
      if (!fetchOriginal) throw new Error("mock de serviço indisponível");
      return fetchOriginal(url);
    });
    vi.setSystemTime(new Date("2097-11-03T18:00:00Z"));
    abrir();

    expect(await screen.findByText(/Não foi possível consultar os feriados/)).toBeTruthy();
    expect(screen.queryByRole("radio", { name: /8h às 9h/ })).toBeNull();
    expect((screen.getByRole("button", { name: /Finalizar pedido/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("a comanda registra a data do horário da manhã escolhido", async () => {
    const u = userEvent.setup();
    abrir();
    await u.click(screen.getByRole("radio", { name: /Retirada na casa/ }));
    await u.type(screen.getByLabelText("Nome*"), "Rodolpho");
    await u.type(screen.getByLabelText("Telefone / WhatsApp*"), "82991520132");
    await u.click(screen.getByRole("radio", { name: "8h às 9h, amanhã" }));
    await u.click(screen.getByRole("radio", { name: "Pix" }));
    await u.click(screen.getByRole("button", { name: /Finalizar pedido/ }));

    expect(await screen.findByRole("heading", { name: "Falta só um passo" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Resumo" }).textContent).toContain("Horário: amanhã, 8h às 9h");
  });

  it("Delivery vem primeiro e já marcado; Retirada na casa dispensa o endereço e segue na comanda", async () => {
    const u = userEvent.setup();
    abrir();
    const tipos = (screen.getAllByRole("radio") as HTMLInputElement[]).filter((r) => r.name === "tipo");
    expect(tipos.map((r) => r.value)).toEqual(["entrega", "retirada"]);
    expect(tipos[0].checked).toBe(true);
    expect(screen.getByLabelText("CEP*")).toBeTruthy();

    await u.click(screen.getByRole("radio", { name: /Retirada na casa/ }));
    expect(screen.queryByLabelText("CEP*")).toBeNull();
    expect(screen.getByText(/Enviamos o endereço para retirada/)).toBeTruthy();
    expect(screen.getByRole("radio", { name: /Cartão na retirada/ })).toBeTruthy();

    await u.type(screen.getByLabelText("Nome*"), "Rodolpho");
    await u.type(screen.getByLabelText("Telefone / WhatsApp*"), "82991520132");
    await u.click(screen.getByRole("radio", { name: /18h às 19h/ }));
    await u.click(screen.getByRole("radio", { name: "Pix" }));
    await u.click(screen.getByRole("button", { name: /Finalizar pedido/ }));

    expect(await screen.findByRole("heading", { name: "Falta só um passo" })).toBeTruthy();
    const previa = screen.getByRole("group", { name: "Resumo" });
    expect(previa.textContent).toContain("RETIRADA NA CASA");
    expect(previa.textContent).toContain("Horário: hoje, 18h às 19h");
    expect(previa.textContent).not.toContain("CEP");
    expect(previa.textContent).not.toContain("Entrega:");
    expect(previa.textContent).toContain("TOTAL: R$ 27,98");

    await u.click(screen.getByRole("link", { name: /Enviar comanda para o WhatsApp/ }));
    expect(await screen.findByText(/Retirada na casa das 17h às 21h/, {}, { timeout: 2000 })).toBeTruthy();
  });

  it("CEP que falha não trava: avisa e deixa preencher à mão", async () => {
    viaCepFalha = true;
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
