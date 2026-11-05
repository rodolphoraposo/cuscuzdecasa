// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErroGeral } from "./ErroGeral";

afterEach(cleanup);

function Bomba(): never { throw new Error("falha de teste"); }

describe("ErroGeral", () => {
  it("mostra uma saída amigável quando uma tela quebra", () => {
    const silencio = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErroGeral><Bomba /></ErroGeral>);
    expect(screen.getByRole("heading", { level: 1, name: "Algo deu errado" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Voltar ao início" }).getAttribute("href")).toBe("/");
    silencio.mockRestore();
  });
  it("sem erro, só mostra o conteúdo", () => {
    render(<ErroGeral><p>tudo certo</p></ErroGeral>);
    expect(screen.getByText("tudo certo")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
