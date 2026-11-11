// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RastreadorDePaginas } from "./RastreadorDePaginas";
import * as analytics from "../lib/analytics";

let ir: ReturnType<typeof useNavigate>;
function Capturar() { ir = useNavigate(); return null; }

beforeEach(() => { vi.useFakeTimers(); vi.spyOn(analytics, "registrarPagina").mockImplementation(() => {}); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

const montar = () => render(<MemoryRouter initialEntries={["/"]}><RastreadorDePaginas /><Capturar /></MemoryRouter>);
const passar = () => act(() => { vi.runAllTimers(); });

describe("RastreadorDePaginas", () => {
  it("conta a tela inicial e cada tela nova, mas não troca de aba, vista ou âncora na mesma tela", () => {
    montar(); passar();
    expect(analytics.registrarPagina).toHaveBeenCalledTimes(1);

    act(() => ir("/?categoria=doces", { replace: true })); passar();
    act(() => ir("/?categoria=doces&vista=grade#cardapio", { replace: true })); passar();
    expect(analytics.registrarPagina).toHaveBeenCalledTimes(1);

    act(() => ir("/cardapio/carne-de-sol")); passar();
    expect(analytics.registrarPagina).toHaveBeenCalledTimes(2);
  });

  it("um redirecionamento imediato (/cardapio → /) não conta a tela intermediária", () => {
    montar(); passar();
    vi.mocked(analytics.registrarPagina).mockClear();
    act(() => { ir("/cardapio"); ir("/", { replace: true }); }); passar();
    expect(analytics.registrarPagina).toHaveBeenCalledTimes(0); // voltou à mesma tela: nada novo
  });
});
