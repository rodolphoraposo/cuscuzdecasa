// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { produtos } from "../data/menu";
import { FotoProduto } from "./FotoProduto";

afterEach(cleanup);
const base = produtos[0];

describe("FotoProduto", () => {
  it("com foto, mostra a imagem com o nome do prato", () => {
    render(<FotoProduto produto={{ ...base, imagem: "/x.webp" }} />);
    expect(screen.getByRole("img", { name: base.nome })).toBeTruthy();
  });
  it("sem foto, avisa 'Foto em breve' em vez de quebrar", () => {
    render(<FotoProduto produto={{ ...base, imagem: undefined }} />);
    expect(screen.getByRole("img", { name: `Foto de ${base.nome} em breve` })).toBeTruthy();
  });
});
