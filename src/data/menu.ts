import carneMoida from "../assets/img/carne-moida.webp";
import salsicha from "../assets/img/salsicha-ao-molho.webp";
import calabresa from "../assets/img/calabresa.webp";
import frango from "../assets/img/frango-desfiado.webp";
import carneDeSol from "../assets/img/carne-de-sol.webp";
import romeu from "../assets/img/romeu-e-julieta.webp";
import cartola from "../assets/img/cartola.webp";
import coca from "../assets/img/coca-cola.webp";
import guarana from "../assets/img/guarana-antartica.webp";
import fanta from "../assets/img/fanta-laranja.webp";
import agua from "../assets/img/agua-mineral.webp";

export type CategoriaId = "salgados" | "doces" | "bebidas";

export interface Categoria {
  id: CategoriaId;
  nome: string;
}

export interface Produto {
  id: string;
  categoria: CategoriaId;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  /** "contain" para embalagens com fundo branco (bebidas) */
  ajuste?: "cover" | "contain";
}

export const categorias: Categoria[] = [
  { id: "salgados", nome: "Salgados" },
  { id: "doces", nome: "Doces" },
  { id: "bebidas", nome: "Bebidas" },
];

const acomp = "com acompanhamento à sua escolha";

export const produtos: Produto[] = [
  { id: "carne-moida", categoria: "salgados", nome: "Carne Moída", descricao: `Carne Moída de 1°, ${acomp}`, preco: 11.99, imagem: carneMoida },
  { id: "salsicha-ao-molho", categoria: "salgados", nome: "Salsicha ao molho", descricao: `Salsicha ao molho de tomate, ${acomp}`, preco: 11.99, imagem: salsicha },
  { id: "calabresa", categoria: "salgados", nome: "Calabresa", descricao: `Calabresa refogada, ${acomp}`, preco: 13.99, imagem: calabresa },
  { id: "frango-desfiado", categoria: "salgados", nome: "Frango desfiado", descricao: `Frango desfiado refogado, ${acomp}`, preco: 14.99, imagem: frango },
  { id: "carne-de-sol", categoria: "salgados", nome: "Carne de Sol", descricao: `Carne de sol refogada, ${acomp}`, preco: 14.99, imagem: carneDeSol },

  { id: "romeu-e-julieta", categoria: "doces", nome: "Romeu & Julieta", descricao: `Goiabada com queijo coalho, ${acomp}`, preco: 12.99, imagem: romeu },
  { id: "cartola", categoria: "doces", nome: "Cartola", descricao: `Banana frita com queijo coalho, ${acomp}`, preco: 12.99, imagem: cartola },

  { id: "coca-cola", categoria: "bebidas", nome: "Coca-Cola", descricao: "Refrigerante em lata - 350ml", preco: 5.99, imagem: coca },
  { id: "guarana-antartica", categoria: "bebidas", nome: "Guaraná Antártica", descricao: "Refrigerante em lata - 350ml", preco: 5.99, imagem: guarana },
  { id: "fanta-laranja", categoria: "bebidas", nome: "Fanta laranja", descricao: "Refrigerante em lata - 350ml", preco: 5.99, imagem: fanta },
  { id: "agua-mineral", categoria: "bebidas", nome: "Água mineral sem gás", descricao: "Garrafa pet - 500ml", preco: 2.99, imagem: agua },
];

/** Produtos que aparecem na prévia da Home */
export const destaquesHome = ["frango-desfiado", "carne-de-sol", "calabresa", "cartola"];

export const condominios = [
  "Horto Jardins Serraria",
  "Vila Bella",
  "Santa Ana",
  "Bethaville",
  "Rui Palmeira",
  "Residencial Serraria",
  "Jardim Aristídes",
  "José Tenório",
  "Eco Vilares I e II",
  "Sierra Park",
];

export const contato = {
  /** WhatsApp no formato internacional, só dígitos */
  whatsapp: "5582994336126",
  telefoneExibicao: "(82) 99433-6126",
  horarioPedidos: "16h",
  horarioEntrega: "17h às 22h",
};

export const formatarPreco = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
