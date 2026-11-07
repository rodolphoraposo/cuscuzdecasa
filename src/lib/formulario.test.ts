import { describe, expect, it } from "vitest";
import { mascararCep, mascararTelefone, paraDadosPedido, rascunhoVazio, sanearRascunho, validarPedido, valorEmReais, type Rascunho } from "./formulario";

const valido: Rascunho = {
  nome: "Rodolpho", telefone: "(82) 99152-0132", cep: "57046-000", rua: "Rua Exemplo", numero: "120",
  complemento: "Bloco B, apto 302", bairro: "Serraria", cidade: "Maceió", uf: "AL", horario: "18-19", referencia: "",
  pagamento: "dinheiro", trocoTexto: "50,00", semTroco: false, observacoes: "",
};

describe("máscaras", () => {
  it("telefone com 10 e 11 dígitos, aos poucos", () => {
    expect(mascararTelefone("")).toBe("");
    expect(mascararTelefone("8")).toBe("(8");
    expect(mascararTelefone("829915")).toBe("(82) 9915");
    expect(mascararTelefone("82991520132")).toBe("(82) 99152-0132");
    expect(mascararTelefone("82991520132999")).toBe("(82) 99152-0132");
  });
  it("CEP", () => {
    expect(mascararCep("57046")).toBe("57046");
    expect(mascararCep("57046000")).toBe("57046-000");
  });
});

describe("valorEmReais", () => {
  it.each([["50", 50], ["R$ 50,00", 50], ["1.000,50", 1000.5], ["27,5", 27.5], ["50.00", 50], ["1.000", 1000]])("%s → %s", (t, v) => {
    expect(valorEmReais(t)).toBe(v);
  });
  it.each(["", "abc", "0", "-"])("%j → null", (t) => expect(valorEmReais(t)).toBeNull());
});

describe("validarPedido", () => {
  it("pedido completo não tem erros", () => expect(validarPedido(valido, 22.98)).toEqual({}));
  it("rascunho vazio acusa os campos na ordem do formulário", () => {
    expect(Object.keys(validarPedido(rascunhoVazio, 22.98))).toEqual(
      ["nome", "telefone", "cep", "rua", "numero", "complemento", "bairro", "cidade", "uf", "horario", "pagamento"],
    );
  });
  it("telefone: DDD e nono dígito", () => {
    expect(validarPedido({ ...valido, telefone: "(82) 3152-0132" }, 20).telefone).toBeUndefined();
    expect(validarPedido({ ...valido, telefone: "(82) 89152-0132" }, 20).telefone).toBeDefined();
    expect(validarPedido({ ...valido, telefone: "(02) 99152-0132" }, 20).telefone).toBeDefined();
    expect(validarPedido({ ...valido, telefone: "82991520" }, 20).telefone).toBeDefined();
  });
  it("horário de entrega precisa ser uma das faixas", () => {
    expect(validarPedido({ ...valido, horario: "" }, 20).horario).toBeDefined();
    expect(validarPedido({ ...valido, horario: "03-04" }, 20).horario).toBeDefined();
  });
  it("UF precisa existir", () => expect(validarPedido({ ...valido, uf: "XX" }, 20).uf).toBeDefined());
  it("troco: menor que o total, vazio, e dispensado", () => {
    expect(validarPedido({ ...valido, trocoTexto: "20" }, 22.98).trocoTexto).toContain("R$ 22,98");
    expect(validarPedido({ ...valido, trocoTexto: "" }, 22.98).trocoTexto).toBeDefined();
    expect(validarPedido({ ...valido, trocoTexto: "", semTroco: true }, 22.98)).toEqual({});
    expect(validarPedido({ ...valido, pagamento: "pix", trocoTexto: "" }, 22.98)).toEqual({});
  });
});

describe("paraDadosPedido e sanearRascunho", () => {
  it("troco só vale em dinheiro e com valor", () => {
    expect(paraDadosPedido(valido).trocoPara).toBe(50);
    expect(paraDadosPedido({ ...valido, semTroco: true }).trocoPara).toBeNull();
    expect(paraDadosPedido({ ...valido, pagamento: "pix" }).trocoPara).toBeNull();
  });
  it("descarta formato inesperado do sessionStorage", () => {
    expect(sanearRascunho(null)).toEqual(rascunhoVazio);
    const r = sanearRascunho({ nome: 42, rua: "x".repeat(900), pagamento: "bitcoin", semTroco: "sim" });
    expect(r.nome).toBe("");
    expect(r.rua).toHaveLength(300);
    expect(r.pagamento).toBe("");
    expect(r.semTroco).toBe(false);
  });
});
