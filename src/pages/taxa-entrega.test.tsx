// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider } from "../context/CartContext";
import { limparCacheDeCoordenadas } from "../lib/geocep";
import Finalizar from "./Finalizar";
import Pedido from "./Pedido";

// BrasilAPI simulada: a origem (57046256) é fixa e o cliente fica a `distanciaDoCliente` km ao norte. null = serviço fora do ar.
const ORIGEM = { lat: -9.58, lng: -35.76 };
const aoNorte = (km: number) => ORIGEM.lat + km / 111.19;
let distanciaDoCliente: number | null = 0.8;
const servicos = vi.fn(async (url: RequestInfo | URL) => {
  const u = String(url);
  if (u.includes("viacep.com.br")) return { ok: true, json: async () => ({ logradouro: "Rua Exemplo", bairro: "Serraria", localidade: "Maceió", uf: "AL" }) };
  if (distanciaDoCliente === null) throw new Error("rede");
  const lat = u.endsWith("/57046256") ? ORIGEM.lat : aoNorte(distanciaDoCliente);
  return { ok: true, status: 200, json: async () => ({ location: { coordinates: { latitude: String(lat), longitude: String(ORIGEM.lng) } } }) };
});

function abrir() {
  localStorage.setItem("cuscuz-pedido-v3", JSON.stringify([
    { id: "carne-de-sol", qtd: 1, extras: ["queijo-coalho"], acomp: "vinagrete" },
    { id: "coca-cola", qtd: 1, extras: [], acomp: null },
  ])); // subtotal R$ 28,98
  render(
    <MemoryRouter initialEntries={["/pedido"]}>
      <CartProvider>
        <Routes>
          <Route path="/pedido" element={<Pedido />} />
          <Route path="/pedido/finalizar" element={<Finalizar />} />
          <Route path="/" element={<h1>início</h1>} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  );
}

beforeAll(() => { vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(new Date("2026-11-03T18:00:00Z")); }); // terça, 15h em Maceió
beforeEach(() => {
  localStorage.clear(); sessionStorage.clear(); limparCacheDeCoordenadas();
  distanciaDoCliente = 0.8;
  vi.stubGlobal("fetch", servicos); servicos.mockClear();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.setSystemTime(new Date("2026-11-03T18:00:00Z")); });

const digitarCep = async (u: ReturnType<typeof userEvent.setup>, cep: string) => u.type(screen.getByLabelText("CEP*"), cep);
const entrega = () => screen.getByText("Entrega", { selector: "dt" }).nextElementSibling?.textContent;
async function preencherTudoMenosCep(u: ReturnType<typeof userEvent.setup>) {
  await u.type(screen.getByLabelText("Nome*"), "Rodolpho");
  await u.type(screen.getByLabelText("Telefone / WhatsApp*"), "82994336126");
}
async function completar(u: ReturnType<typeof userEvent.setup>) {
  await u.type(screen.getByLabelText("Número*"), "120");
  await u.type(screen.getByLabelText("Complemento (bloco e apto)*"), "Bloco B, apto 302");
  await u.click(screen.getByRole("radio", { name: "18h às 19h" }));
  await u.click(screen.getByRole("radio", { name: "Pix" }));
}

describe("taxa de entrega por CEP no Seu pedido", () => {
  it("até 500 m a entrega é grátis e o total não muda", async () => {
    distanciaDoCliente = 0.3;
    const u = userEvent.setup();
    abrir();
    await digitarCep(u, "57046000");
    expect(await screen.findByText(/Entregamos aí!/)).toBeTruthy();
    expect(document.body.textContent).toMatch(/Taxa de entrega: grátis/);
    expect(entrega()).toBe("Grátis");
    expect(screen.getByRole("button", { name: /Finalizar pedido/ }).textContent).toMatch(/28,98/);
  });

  it("de 1 a 1,5 km a taxa é R$ 6,00 e entra no total", async () => {
    distanciaDoCliente = 1.3;
    const u = userEvent.setup();
    abrir();
    await digitarCep(u, "57046000");
    await screen.findByText(/Entregamos aí!/);
    expect(entrega()).toMatch(/R\$\s6,00/);
    expect(screen.getByRole("button", { name: /Finalizar pedido/ }).textContent).toMatch(/34,98/);
  });

  it("trocar o CEP descarta a taxa anterior e calcula a nova", async () => {
    const u = userEvent.setup();
    abrir();
    await digitarCep(u, "57046000");
    await screen.findByText(/Entregamos aí!/);
    expect(entrega()).toMatch(/R\$\s4,00/);

    distanciaDoCliente = 0.3;
    await u.clear(screen.getByLabelText("CEP*"));
    expect(entrega()).toBe("A calcular");
    await digitarCep(u, "57046100");
    await waitFor(() => expect(entrega()).toBe("Grátis"));
  });

  it("fora do raio: avisa, não deixa finalizar o delivery e oferece retirada, localização e WhatsApp", async () => {
    distanciaDoCliente = 2.2;
    const u = userEvent.setup();
    abrir();
    await preencherTudoMenosCep(u);
    await digitarCep(u, "57046000");
    expect((await screen.findByRole("alert")).textContent).toMatch(/fora da nossa\s+área de entrega \(até 1,5 km\)/);
    expect(screen.getByRole("link", { name: "Falar no WhatsApp" }).getAttribute("href")).toMatch(/^https:\/\/wa\.me\/55829/);
    await completar(u);
    await u.click(screen.getByRole("button", { name: /Finalizar pedido/ }));
    expect(screen.getByRole("heading", { name: "Seu pedido" })).toBeTruthy(); // não avançou
    expect(document.body.textContent).toMatch(/Esse CEP fica fora da área de entrega/);

    await u.click(screen.getByRole("button", { name: "Prefiro retirar na casa" }));
    expect((screen.getByRole("radio", { name: /Retirada na casa/ }) as HTMLInputElement).checked).toBe(true);
    expect(screen.queryByLabelText("CEP*")).toBeNull();
  });

  it("'Estou no endereço' usa a localização do aparelho e corrige um CEP que o mapa errou", async () => {
    distanciaDoCliente = 2.2; // o CEP "parece" longe, mas o cliente está a 0,9 km
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: (ok: PositionCallback) => ok({ coords: { latitude: aoNorte(0.9), longitude: ORIGEM.lng } } as GeolocationPosition) } });
    const u = userEvent.setup();
    abrir();
    await digitarCep(u, "57046000");
    await screen.findByRole("alert");
    await u.click(screen.getByRole("button", { name: /Estou no endereço: usar minha localização/ }));
    expect(await screen.findByText(/Entregamos aí!/)).toBeTruthy();
    expect(entrega()).toMatch(/R\$\s4,00/);
  });

  it("BrasilAPI fora do ar: não bloqueia, a taxa fica 'a confirmar' e isso vai na comanda", async () => {
    distanciaDoCliente = null;
    const u = userEvent.setup();
    abrir();
    await preencherTudoMenosCep(u);
    await digitarCep(u, "57046000");
    expect(await screen.findByText(/Não conseguimos calcular a taxa agora/)).toBeTruthy();
    expect(entrega()).toBe("A confirmar");
    await completar(u);
    await u.click(screen.getByRole("button", { name: /Finalizar pedido/ }));

    expect(await screen.findByRole("heading", { name: "Falta só um passo" })).toBeTruthy();
    const link = screen.getByRole("link", { name: /Enviar comanda para o WhatsApp/ }) as HTMLAnchorElement;
    const texto = decodeURIComponent(link.href.split("text=")[1]);
    expect(texto).toContain("*Entrega:* a confirmar");
    expect(texto).toContain("*TOTAL (sem a entrega):* R$ 28,98");
  });

  it("um rascunho antigo (CEP completo, taxa não calculada) é calculado ao abrir a tela", async () => {
    sessionStorage.setItem("cuscuz-rascunho-v1", JSON.stringify({ tipo: "entrega", cep: "57046-000", rua: "Rua Exemplo" }));
    abrir();
    expect(await screen.findByText(/Entregamos aí!/)).toBeTruthy();
    expect(entrega()).toMatch(/R\$\s4,00/);
  });
});
