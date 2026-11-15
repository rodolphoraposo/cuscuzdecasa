// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { CartProvider } from "../context/CartContext";
import * as analytics from "../lib/analytics";
import { limparCacheDeCoordenadas } from "../lib/geocep";

const ORIGEM = { lat: -9.58, lng: -35.76 };
let distancia: number | null = 0.8;
const servicos = vi.fn(async (url: RequestInfo | URL) => {
  if (distancia === null) throw new Error("rede");
  const lat = String(url).endsWith("/57046256") ? ORIGEM.lat : ORIGEM.lat + distancia / 111.19;
  return { ok: true, status: 200, json: async () => ({ location: { coordinates: { latitude: String(lat), longitude: String(ORIGEM.lng) } } }) };
});
const abrir = () => render(<MemoryRouter><CartProvider><App /></CartProvider></MemoryRouter>);

beforeAll(() => { window.scrollTo = vi.fn() as unknown as typeof window.scrollTo; });
beforeEach(() => { limparCacheDeCoordenadas(); distancia = 0.8; vi.stubGlobal("fetch", servicos); servicos.mockClear(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("Home: onde entregamos e consulta de taxa", () => {
  it("mostra o raio, as faixas e não lista mais condomínios", () => {
    abrir();
    const secao = document.getElementById("onde-entregamos") as HTMLElement;
    expect(secao.textContent).toContain("raio de 1,5 km");
    expect(secao.textContent).toContain("Até 500 m: grátis");
    expect(secao.textContent).toMatch(/De 500 m até 1,0 km: R\$\s4,00/);
    expect(secao.textContent).not.toContain("Sierra Park");
    expect(screen.getByLabelText("Seu CEP")).toBeTruthy();
  });

  it("o CEP completo já mostra a taxa, sem apertar o botão, e registra a consulta sem o CEP", async () => {
    const eventos = vi.spyOn(analytics, "registrarEvento").mockImplementation(() => {});
    const u = userEvent.setup();
    abrir();
    await u.type(screen.getByLabelText("Seu CEP"), "57046000");
    expect(await screen.findByText(/Entregamos aí!/)).toBeTruthy();
    expect(document.getElementById("onde-entregamos")!.textContent).toMatch(/Taxa de entrega: R\$\s4,00/);
    expect(eventos).toHaveBeenCalledWith("consulta_entrega", { origem: "home", resultado: "dentro", taxa: 4 });
    expect(JSON.stringify(eventos.mock.calls)).not.toContain("57046000");
  });

  it("fora da área, avisa e oferece localização e WhatsApp; CEP alterado limpa o resultado", async () => {
    distancia = 2.5;
    const u = userEvent.setup();
    abrir();
    await u.type(screen.getByLabelText("Seu CEP"), "57046000");
    expect((await screen.findByRole("alert")).textContent).toMatch(/fora da nossa\s+área de entrega/);
    expect(screen.getAllByRole("link", { name: "Falar no WhatsApp" }).length).toBeGreaterThan(0);
    await u.type(screen.getByLabelText("Seu CEP"), "{backspace}");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("serviço fora do ar: avisa que a taxa será confirmada no WhatsApp", async () => {
    distancia = null;
    const u = userEvent.setup();
    abrir();
    await u.type(screen.getByLabelText("Seu CEP"), "57046000");
    expect(await screen.findByText(/Não conseguimos calcular a taxa agora/)).toBeTruthy();
  });
});
