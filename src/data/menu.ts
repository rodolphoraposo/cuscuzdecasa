
export type CategoriaId = "salgados" | "doces" | "bebidas";

export interface Categoria {
  id: CategoriaId;
  nome: string;
}

import { ENTREGA_FIM_H, ENTREGA_INICIO_H, LIMITE_PEDIDO_H } from "../lib/entrega";

export type PratoId = "cuscuz" | "macaxeira";
export const pratos: { id: PratoId; nome: string }[] = [
  { id: "cuscuz", nome: "Cuscuz" },
  { id: "macaxeira", nome: "Macaxeira" },
];

export interface Produto {
  id: string;
  categoria: CategoriaId;
  nome: string;
  descricao: string;
  preco: number;
  /** Sem foto ainda: a tela mostra "Foto em breve" */
  imagem?: string;
  /** Base do prato (bebidas não têm) */
  prato?: PratoId;
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

/** Nome do prato com a base, para o carrinho e a comanda: "Do Sertão (cuscuz)". */
export const nomeCompleto = (p: Produto) => (p.prato ? `${p.nome} (${p.prato})` : p.nome);

const catalogo: Produto[] = [
  // ---------- Cuscuz · salgados ----------
  {
    id: "frango-desfiado", prato: "cuscuz", categoria: "salgados", nome: "Asa Branca", descricao: "Frango desfiado bem temperadinho", preco: 14.99,
    descricaoLonga: "Cuscuz de milho quentinho e fofinho, recheado com peito de frango desfiado, refogado em temperos naturais e muito suculento.",
    dica: "Fica perfeito com adicional de requeijão tipo Catupiry ou Queijo Coalho!",
  },
  {
    id: "carne-de-sol", prato: "cuscuz", categoria: "salgados", nome: "Do Sertão", descricao: "Carne de sol desfiada acebolada", preco: 14.99,
    descricaoLonga: "O legítimo sabor nordestino! Cuscuz fofinho recheado com carne de sol artesanal, desfiada e acebolada na medida certa.",
    dica: "Adicione Queijo Coalho tostado e mude o seu dia!",
  },
  {
    id: "calabresa", prato: "cuscuz", categoria: "salgados", nome: "Arretado", descricao: "Calabresa fina defumada", preco: 13.99,
    descricaoLonga: "Para quem ama sabor marcante. Cuscuz de milho recheado com finas rodelas de calabresa defumada, salteadas até ficarem bem douradinhas.",
    dica: "Combina muito com um Ovo Mexido por cima.",
  },
  {
    id: "carne-moida", prato: "cuscuz", categoria: "salgados", nome: "Tropeiro", descricao: "Carne moída bem suculenta", preco: 11.99,
    descricaoLonga: "Comida com gostinho de casa! Cuscuz recheado com carne moída bem soltinha, cozida com temperos frescos e muito molhadinha.",
    dica: "Experimente adicionar Mussarela derretida.",
  },
  {
    id: "salsicha-ao-molho", prato: "cuscuz", categoria: "salgados", nome: "De Feira", descricao: "Salsicha ao molho caseiro", preco: 11.99,
    descricaoLonga: "Aquele clássico irresistível. Salsichas picadas em um molho de tomate caseiro encorpado, temperado com carinho e servido com nosso cuscuz quentinho.",
  },
  // ---------- Cuscuz · doces ----------
  {
    id: "cartola", prato: "cuscuz", categoria: "doces", nome: "Cartola", descricao: "Banana frita com queijo coalho, açúcar e canela", preco: 12.99,
    descricaoLonga: "A sobremesa mais amada do Nordeste em forma de cuscuz! Camadas de banana frita na chapa, queijo coalho derretido, finalizadas com uma chuvinha de açúcar e canela. Conforto em cada garfada.",
  },
  {
    id: "romeu-e-julieta", prato: "cuscuz", categoria: "doces", nome: "Romeu & Julieta", descricao: "Queijo coalho derretido com goiabada cascão", preco: 12.99,
    descricaoLonga: "A combinação perfeita do salgado com o doce. Cuscuz quentinho recheado com o sabor marcante do queijo coalho derretido e a suavidade da goiabada cascão cremosa.",
  },

  // ---------- Macaxeira ----------
  // ATENÇÃO: preços PROVISÓRIOS (iguais aos do cuscuz equivalente) e sem foto. Confirme os valores antes de publicar.
  // As dicas de Quintura (bacon), Da Terra (ovo frito) e Luar do Sertão (melaço) esperam esses itens existirem em "adicionais".
  {
    id: "macaxeira-frango", prato: "macaxeira", categoria: "salgados", nome: "Aprumada", descricao: "Frango desfiado super suculento", preco: 14.99,
    descricaoLonga: "Macaxeira cozida no ponto certo e finalizada na chapa, coberta com peito de frango desfiado super suculento, refogado em temperos naturais e ervas frescas.",
    dica: "Fica perfeita com adicional de Requeijão Cremoso maçaricado!",
  },
  {
    id: "macaxeira-carne-de-sol", prato: "macaxeira", categoria: "salgados", nome: "Fulô de Mandacaru", descricao: "Carne de sol em cubos acebolada na manteiga de garrafa", preco: 14.99,
    descricaoLonga: "Forte e marcante como o Sertão! Macaxeira super macia servida com uma generosa porção de carne de sol artesanal, desfiada e acebolada na manteiga de garrafa.",
    dica: "Adicione Queijo Coalho tostado e mude o seu dia!",
  },
  {
    id: "macaxeira-calabresa", prato: "macaxeira", categoria: "salgados", nome: "Quintura", descricao: "Calabresa defumada em rodelas, dourada e crocante", preco: 13.99,
    descricaoLonga: "Para quem ama sabor intenso e marcante. Nossa macaxeira fumegante coberta com cubos de calabresa defumada, salteados na chapa até ficarem bem dourados e crocantes.",
  },
  {
    id: "macaxeira-carne-suina", prato: "macaxeira", categoria: "salgados", nome: "Arriégua", descricao: "Carne suína em cubos acebolada", preco: 11.99,
    descricaoLonga: "Aquele gostinho inconfundível de comida afetiva feita em casa. Macaxeira cozida derretendo na boca, servida com carne suína em cubos acebolada, temperos frescos e muito molhadinha.",
    dica: "Experimente adicionar Queijo Mussarela derretido.",
  },
  {
    id: "macaxeira-salsicha", prato: "macaxeira", categoria: "salgados", nome: "Da Terra", descricao: "Salsicha ao molho de tomate caseiro", preco: 11.99,
    descricaoLonga: "O clássico popular que todo mundo respeita. Salsichas picadas em um molho de tomate caseiro encorpado, temperado com carinho e servido sobre a nossa macaxeira quentinha.",
  },
  {
    id: "macaxeira-cartola", prato: "macaxeira", categoria: "doces", nome: "Luar do Sertão", descricao: "Banana frita, queijo coalho, açúcar e canela", preco: 12.99,
    descricaoLonga: "Uma releitura surpreendente e iluminada da nossa sobremesa mais famosa. Macaxeira dourada na chapa, servida com fatias de banana frita, queijo coalho derretido e finalizada com açúcar e canela.",
  },
  {
    id: "macaxeira-romeu-e-julieta", prato: "macaxeira", categoria: "doces", nome: "Xodózin", descricao: "Queijo coalho com goiabada cascão derretida", preco: 12.99,
    descricaoLonga: "Aquele abraço quente entre o doce e o salgado. Macaxeira quentinha que desmancha na boca, acompanhada do sabor marcante do queijo coalho e o toque cremoso da goiabada cascão derretida.",
  },

  // ---------- Bebidas ----------
  { id: "coca-cola", categoria: "bebidas", nome: "Coca-Cola 350ml", descricao: "Refrigerante em lata - 350ml", preco: 5.99 },
  { id: "guarana-antartica", categoria: "bebidas", nome: "Guaraná Antártica", descricao: "Refrigerante em lata - 350ml", preco: 5.99 },
  { id: "fanta-laranja", categoria: "bebidas", nome: "Fanta laranja", descricao: "Refrigerante em lata - 350ml", preco: 5.99 },
  { id: "agua-mineral", categoria: "bebidas", nome: "Água mineral sem gás", descricao: "Garrafa pet - 500ml", preco: 2.99 },
];

/** Fotos de src/assets/produtos (sempre .webp), achadas pelo nome do arquivo. Sem arquivo, a tela mostra "Foto em breve". */
const arquivos = import.meta.glob<string>("../assets/produtos/*.webp", { eager: true, import: "default" });
const foto = (nome: string): string | undefined =>
  Object.entries(arquivos).find(([caminho]) => caminho.endsWith(`/${nome}.webp`))?.[1];

/** Qual arquivo é a foto de cada produto (nome do arquivo sem o ".webp"). */
export const arquivoDaFoto: Record<string, string> = {
  "frango-desfiado": "asa_branca",
  "carne-de-sol": "do_sertao",
  calabresa: "arretado",
  "carne-moida": "tropeiro",
  "salsicha-ao-molho": "de_feira",
  cartola: "cartola",
  "romeu-e-julieta": "romeu_e_julieta",
  "macaxeira-frango": "aprumada",
  "macaxeira-carne-de-sol": "fulo_de_mandacaru",
  "macaxeira-calabresa": "quintura",
  "macaxeira-carne-suina": "arriegua",
  "macaxeira-salsicha": "da_terra",
  "macaxeira-cartola": "luardosertao",
  "macaxeira-romeu-e-julieta": "xodozin",
  "coca-cola": "coca-cola",
  "guarana-antartica": "guarana-antartica",
  "fanta-laranja": "fanta_laranja",
  "agua-mineral": "agua_sem_gas",
};

export const produtos: Produto[] = catalogo.map((p) => ({ ...p, imagem: foto(arquivoDaFoto[p.id]) }));

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
  horarioPedidos: `${LIMITE_PEDIDO_H}h`,
  horarioEntrega: `${ENTREGA_INICIO_H}h às ${ENTREGA_FIM_H}h`,
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
