import carneMoida from "../assets/produtos/carne-moida.webp";
import salsicha from "../assets/produtos/salsicha-ao-molho.webp";
import calabresa from "../assets/produtos/calabresa.webp";
import frango from "../assets/produtos/frango-desfiado.webp";
import carneDeSol from "../assets/produtos/carne-de-sol.webp";
import romeu from "../assets/produtos/romeu-e-julieta.webp";
import cartola from "../assets/produtos/cartola.webp";
import coca from "../assets/produtos/coca-cola.webp";
import guarana from "../assets/produtos/guarana-antartica.webp";
import fanta from "../assets/produtos/fanta-laranja.webp";
import agua from "../assets/produtos/agua-mineral.webp";

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
  /** Texto longo do Detalhe do item (a lista usa só "descricao") */
  descricaoLonga?: string;
  /** "Dica da casa", mostrada no Detalhe */
  dica?: string;
  /** "contain" para embalagens com fundo branco (bebidas) */
  ajuste?: "cover" | "contain";
}

export const categorias: Categoria[] = [
  { id: "salgados", nome: "Salgados" },
  { id: "doces", nome: "Doces" },
  { id: "bebidas", nome: "Bebidas" },
];

export const produtos: Produto[] = [
  {
    id: "frango-desfiado", categoria: "salgados", nome: "Cuscuz Asa Branca", descricao: "Frango desfiado bem temperadinho", preco: 14.99, imagem: frango,
    descricaoLonga: "Cuscuz de milho quentinho e fofinho, recheado com peito de frango desfiado, refogado em temperos naturais e muito suculento.",
    dica: "Fica perfeito com adicional de requeijão tipo Catupiry ou Queijo Coalho!",
  },
  {
    id: "carne-de-sol", categoria: "salgados", nome: "Cuscuz do Sertão", descricao: "Carne de sol desfiada acebolada", preco: 14.99, imagem: carneDeSol,
    descricaoLonga: "O legítimo sabor nordestino! Cuscuz fofinho recheado com carne de sol artesanal, desfiada e acebolada na medida certa.",
    dica: "Adicione Queijo Coalho tostado e mude o seu dia!",
  },
  {
    id: "calabresa", categoria: "salgados", nome: "Cuscuz Arretado", descricao: "Calabresa fina defumada", preco: 13.99, imagem: calabresa,
    descricaoLonga: "Para quem ama sabor marcante. Cuscuz de milho recheado com finas rodelas de calabresa defumada, salteadas até ficarem bem douradinhas.",
    dica: "Combina muito com um Ovo Mexido por cima.",
  },
  {
    id: "carne-moida", categoria: "salgados", nome: "Cuscuz Tropeiro", descricao: "Carne moída bem suculenta", preco: 11.99, imagem: carneMoida,
    descricaoLonga: "Comida com gostinho de casa! Cuscuz recheado com carne moída bem soltinha, cozida com temperos frescos e muito molhadinha.",
    dica: "Experimente adicionar Mussarela derretida.",
  },
  {
    id: "salsicha-ao-molho", categoria: "salgados", nome: "Cuscuz de Feira", descricao: "Salsicha ao molho caseiro", preco: 11.99, imagem: salsicha,
    descricaoLonga: "Aquele clássico irresistível. Salsichas picadas em um molho de tomate caseiro encorpado, temperado com carinho e servido com nosso cuscuz quentinho.",
  },

  {
    id: "cartola", categoria: "doces", nome: "Cuscuz Cartola", descricao: "Banana frita com queijo coalho, açúcar e canela", preco: 12.99, imagem: cartola,
    descricaoLonga: "A sobremesa mais amada do Nordeste em forma de cuscuz! Camadas de banana frita na chapa, queijo coalho derretido, finalizadas com uma chuvinha de açúcar e canela. Conforto em cada garfada.",
  },
  {
    id: "romeu-e-julieta", categoria: "doces", nome: "Cuscuz Romeu & Julieta", descricao: "Queijo coalho derretido com goiabada cascão", preco: 12.99, imagem: romeu,
    descricaoLonga: "A combinação perfeita do salgado com o doce. Cuscuz quentinho recheado com o sabor marcante do queijo coalho derretido e a suavidade da goiabada cascão cremosa.",
  },

  { id: "coca-cola", categoria: "bebidas", nome: "Coca-Cola 350ml", descricao: "Refrigerante em lata - 350ml", preco: 5.99, imagem: coca },
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

/** Entrega sem taxa (Figma: R$ 0,00). */
export const taxaEntrega = 0;

export const formatarPreco = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export interface Adicional {
  id: string;
  nome: string;
  preco: number;
}

/** Adicionais do Detalhe do item: + R$ 2,00 cada (conforme o Figma). */
export const adicionais: Adicional[] = [
  { id: "queijo-coalho", nome: "Queijo coalho", preco: 2 },
  { id: "mussarela", nome: "Mussarela", preco: 2 },
  { id: "ovo-mexido", nome: "Ovo mexido", preco: 2 },
  { id: "requeijao", nome: "Requeijão", preco: 2 },
  { id: "ovo-cozido", nome: "Ovo cozido", preco: 2 },
];

/** Categorias que aceitam adicionais (suposição: só os salgados). */
const categoriasComAdicionais: CategoriaId[] = ["salgados"];
export const aceitaAdicionais = (p: Produto) => categoriasComAdicionais.includes(p.categoria);

export interface Acompanhamento {
  id: string;
  nome: string;
  descricao?: string;
}

/** Acompanhamento obrigatório dos salgados (o cliente escolhe um). */
export const acompanhamentos: Acompanhamento[] = [
  { id: "vinagrete", nome: "Vinagrete da casa" },
  {
    id: "refogado",
    nome: "Refogado especial da casa",
    descricao: "Cenoura, pimentão e repolho em tiras finas, levemente refogados na margarina com shoyu e, às vezes, chimichurri.",
  },
];
/** Suposição: só os salgados têm acompanhamento (os doces não). */
export const exigeAcompanhamento = (p: Produto) => p.categoria === "salgados";
