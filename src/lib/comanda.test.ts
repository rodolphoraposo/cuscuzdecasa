import { describe, expect, it } from "vitest";
import {
  numeroPedido,
  formatarTelefone,
  limpar,
  linkWhatsApp,
  montarComanda,
  type DadosPedido,
  type ItemComanda,
} from "./comanda";

// 03/11/2026 18:45 em Maceió (UTC-3)
const agora = new Date("2026-11-03T21:45:00Z");

const pedido: DadosPedido = {
  nome: "Rodolpho",
  telefone: "82991520132",
  cep: "57046000",
  rua: "Rua Exemplo",
  numero: "123",
  complemento: "Bloco A, apto 101",
  bairro: "Serraria",
  cidade: "Maceió",
  uf: "AL",
  referencia: "Portaria 2",
  pagamento: "dinheiro",
  trocoPara: 50,
  observacoes: "Sem cebola",
};

const itens: ItemComanda[] = [
  {
    nome: "Carne de Sol",
    quantidade: 1,
    extras: ["Queijo coalho"],
    subtotal: 16.99,
  },
  { nome: "Coca-Cola", quantidade: 1, extras: [], subtotal: 5.99 },
];
const totais = { subtotal: 22.98, entrega: 0, total: 22.98 };

describe("montarComanda", () => {
  it("segue o modelo da comanda (dinheiro com troco)", () => {
    expect(montarComanda(pedido, itens, totais, agora).texto).toBe(
      [
        "*COMANDA · CUSCUZ DE CASA*",
        "Pedido #7500 · 03/11/2026 18:45",
        "",
        "*CLIENTE*",
        "Rodolpho",
        "Tel: (82) 99152-0132",
        "",
        "*ENTREGA*",
        "Rua Exemplo, 123 - Serraria",
        "Maceió/AL · CEP 57046-000",
        "Compl.: Bloco A, apto 101",
        "Ref.: Portaria 2",
        "",
        "*ITENS*",
        "```1x Carne de Sol .. R$ 16,99",
        "   + Queijo coalho",
        "1x Coca-Cola ...... R$ 5,99```",
        "",
        "*Subtotal:* R$ 22,98",
        "*Entrega:* R$ 0,00",
        "*TOTAL:* R$ 22,98",
        "",
        "*PAGAMENTO:* Dinheiro",
        "Troco para: R$ 50,00 (levar R$ 27,02)",
        "",
        "*OBS:* Sem cebola",
      ].join("\n"),
    );
  });

  it("Pix: sem linha de troco; referência e observações vazias são omitidas", () => {
    const { texto } = montarComanda(
      { ...pedido, pagamento: "pix", referencia: " ", observacoes: "" },
      itens,
      totais,
      agora,
    );
    expect(texto).toContain("*PAGAMENTO:* Pix");
    expect(texto).not.toContain("Troco");
    expect(texto).not.toContain("Ref.:");
    expect(texto).not.toContain("*OBS:*");
  });

  it("dinheiro sem troco", () => {
    expect(
      montarComanda({ ...pedido, trocoPara: null }, itens, totais, agora).texto,
    ).toContain("Troco: não precisa");
  });

  it("recusa troco menor que o total e pedido vazio", () => {
    expect(() =>
      montarComanda({ ...pedido, trocoPara: 20 }, itens, totais, agora),
    ).toThrow(RangeError);
    expect(() => montarComanda(pedido, [], totais, agora)).toThrow(RangeError);
  });

  it("neutraliza formatação e caracteres de controle digitados pelo cliente", () => {
    const { texto } = montarComanda(
      {
        ...pedido,
        nome: "*Ana*\n_Maria_\u202e",
        observacoes: "~sem~ `cebola`",
      },
      itens,
      totais,
      agora,
    );
    expect(texto).toContain("*CLIENTE*\nAna Maria\n");
    expect(texto).toContain("*OBS:* sem cebola");
  });
});

describe("auxiliares", () => {
  it("número do pedido: padrão #0000, no horário de Maceió", () => {
    expect(numeroPedido(new Date("2026-11-03T21:45:00Z"))).toBe("#7500"); // 18:45:00
    expect(numeroPedido(new Date("2026-11-03T21:45:42Z"))).toBe("#7542");
    expect(numeroPedido(new Date("2026-11-04T02:05:00Z"))).toBe("#3100"); // 23:05:00 de 03/11
    expect(numeroPedido(new Date("2026-11-04T03:00:00Z"))).toBe("#0001"); // meia-noite nunca vira #0000
    expect(numeroPedido(new Date())).toMatch(/^#\d{4}$/);
  });
  it("telefone com 10 e 11 dígitos", () => {
    expect(formatarTelefone("(82) 3152-0132")).toBe("(82) 3152-0132");
    expect(formatarTelefone("82 9 9152 0132")).toBe("(82) 99152-0132");
  });
  it("limpar corta no limite", () => {
    expect(limpar("a".repeat(500), 300)).toHaveLength(300);
  });
  it("link do WhatsApp codifica o texto", () => {
    expect(linkWhatsApp("+55 82 99152-0132", "a b\n*c*")).toBe(
      "https://wa.me/5582991520132?text=a%20b%0A*c*",
    );
  });
});

describe("acompanhamento na comanda", () => {
  it("aparece abaixo do item, antes dos adicionais", () => {
    const { texto } = montarComanda(
      pedido,
      [
        {
          nome: "Cuscuz do Sertão",
          quantidade: 1,
          acompanhamento: "Refogado especial da casa",
          extras: ["Mussarela"],
          subtotal: 16.99,
        },
        itens[1],
      ],
      totais,
      agora,
    );
    expect(texto).toContain(
      "1x Cuscuz do Sertão .. R$ 16,99\n   Acomp.: Refogado especial da casa\n   + Mussarela\n1x Coca-Cola",
    );
  });
});

describe("horário de entrega na comanda", () => {
  it("aparece logo abaixo de *ENTREGA*", () => {
    const { texto } = montarComanda(
      { ...pedido, entrega: "hoje, 18h às 19h" },
      itens,
      totais,
      agora,
    );
    expect(texto).toContain(
      "*ENTREGA*\nHorário: hoje, 18h às 19h\nRua Exemplo, 123 - Serraria",
    );
  });
});

describe("itens em fonte monoespaçada", () => {
  it("fica entre ``` e o fim das linhas (preços) alinha mesmo com preços de tamanhos diferentes", () => {
    const { texto } = montarComanda(pedido, itens, totais, agora);
    const bloco = texto
      .split("```")[1]
      .trim()
      .split("\n")
      .filter((l) => !l.startsWith("   "));
    expect(bloco.map((l) => l.length)).toEqual([27, 27]);
  });
  it("o cliente não consegue abrir nem fechar o bloco com crases", () => {
    const { texto } = montarComanda(
      { ...pedido, nome: "``` abre", observacoes: "```" },
      itens,
      totais,
      agora,
    );
    expect(texto.split("```")).toHaveLength(3); // só as duas crases triplas da comanda
  });
});

describe("pagamento no cartão", () => {
  it("avisa quem entrega para levar a maquineta", () => {
    const { texto } = montarComanda(
      { ...pedido, pagamento: "cartao", trocoPara: null },
      itens,
      totais,
      agora,
    );
    expect(texto).toContain("*PAGAMENTO:* Cartão na entrega · levar maquineta");
    expect(texto).not.toContain("Troco");
  });
});
