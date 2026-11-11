
export type CategoriaId = "salgados" | "doces" | "bebidas";

export interface Categoria {
  id: CategoriaId;
  nome: string;
}

import { ENTREGA_FIM_H, ENTREGA_INICIO_H, LIMITE_PEDIDO_H, TEXTO_DIAS } from "../lib/entrega";

export type PratoId = "cuscuz" | "macaxeira";
export const pratos: { id: PratoId; nome: string }[] = [
  { id: "cuscuz", nome: "Cuscuz" },
  { id: "macaxeira", nome: "Macaxeira" },
];

/** Botões do topo do Cardápio: dois pratos e as bebidas. */
export type SecaoId = PratoId | "bebidas";
export const secoes: { id: SecaoId; nome: string }[] = [...pratos, { id: "bebidas", nome: "Bebidas" }];

/** Abas de Cuscuz e Macaxeira (Bebidas não tem abas). */
export type AbaId = "todos" | "salgados" | "doces";
export const abas: { id: AbaId; nome: string }[] = [
  { id: "todos", nome: "Todos" },
  { id: "salgados", nome: "Salgados" },
  { id: "doces", nome: "Doces" },
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
    id: "frango-desfiado", prato: "cuscuz", categoria: "salgados", nome: "Asa Branca", descricao: "Frango desfiado bem temperadinho", preco: 15.99,
    descricaoLonga: "Cuscuz de milho quentinho e fofinho, recheado com peito de frango desfiado, refogado em temperos naturais e muito suculento.",
    dica: "Fica perfeito com adicional de requeijão tipo Catupiry, muçarela ou queijo coalho!",
  },
  {
    id: "calabresa", prato: "cuscuz", categoria: "salgados", nome: "Arretado", descricao: "Calabresa defumada ralada", preco: 15.99,
    descricaoLonga: "Para quem ama sabor marcante. Cuscuz de milho recheado com finas rodelas de calabresa defumada, salteadas até ficarem bem douradinhas.",
    dica: "Combina muito com ovo mexido ou uma fatia de muçarela.",
  },
  {
    id: "salsicha-ao-molho", prato: "cuscuz", categoria: "salgados", nome: "De Feira", descricao: "Salsicha ao molho caseiro", preco: 15.99,
    descricaoLonga: "Aquele clássico irresistível: rodelas de salsicha em molho de tomate especial da casa, temperado com carinho e acompanhadas do nosso cuscuz quentinho.",
    dica: "Combina muito com ovo cozido ou uma fatia de muçarela.",
  },
  {
    id: "carne-de-sol", prato: "cuscuz", categoria: "salgados", nome: "Do Sertão", descricao: "Carne de sol desfiada refogada", preco: 17.99,
    descricaoLonga: "O legítimo sabor nordestino! Cuscuz fofinho recheado com carne de sol artesanal, desfiada e acebolada na medida certa.",
    dica: "Adicione queijo coalho ou requeijão tipo Catupiry e mude o seu dia!",
  },
  // {
  //   id: "carne-moida", prato: "cuscuz", categoria: "salgados", nome: "Tropeiro", descricao: "Carne moída bem suculenta", preco: 11.99,
  //   descricaoLonga: "Comida com gostinho de casa! Cuscuz recheado com carne moída bem soltinha, cozida com temperos frescos e muito molhadinha.",
  //   dica: "Experimente adicionar muçarela derretida.",
  // },
  // ---------- Cuscuz · doces ----------
  {
    id: "cartola", prato: "cuscuz", categoria: "doces", nome: "Cartola", descricao: "Banana, coalho, açúcar e canela", preco: 17.99,
    descricaoLonga: "A sobremesa mais amada do Nordeste em forma de cuscuz! Camadas de banana frita na chapa, queijo coalho derretido, finalizadas com uma chuvinha de açúcar e canela. Conforto em cada garfada.",
  },
  {
    id: "romeu-e-julieta", prato: "cuscuz", categoria: "doces", nome: "Romeu & Julieta", descricao: "Queijo coalho com goiabada", preco: 17.99,
    descricaoLonga: "A combinação perfeita do salgado com o doce. Cuscuz quentinho recheado com o sabor marcante do queijo coalho derretido e a suavidade da goiabada cascão cremosa.",
  },

  // ---------- Macaxeira ----------
  // Confirme os preços de macaxeira antes de publicar.
  {
    id: "macaxeira-frango", prato: "macaxeira", categoria: "salgados", nome: "Aprumada", descricao: "Frango em cubos, bem suculento", preco: 15.99,
    descricaoLonga: "Macaxeira cozida no ponto certo, coberta com cubos suculentos de peito de frango, refogados com temperos naturais, cebola e pimentão.",
    dica: "Fica perfeita com adicional de requeijão cremoso!",
  },
  {
    id: "macaxeira-calabresa", prato: "macaxeira", categoria: "salgados", nome: "Quintura", descricao: "Calabresa defumada em rodelas, dourada e crocante", preco: 15.99,
    descricaoLonga: "Para quem ama sabores intensos e marcantes: nossa macaxeira é coberta com rodelas de calabresa defumada e anéis de cebola.",
    dica: "Adicione queijo coalho ou ovo mexido para completar!",
  },
  {
    id: "macaxeira-salsicha", prato: "macaxeira", categoria: "salgados", nome: "Da Terra", descricao: "Salsicha ao molho de tomate caseiro", preco: 15.99,
    descricaoLonga: "O clássico popular que todo mundo respeita. Salsichas picadas em um molho de tomate caseiro encorpado, temperado com carinho e servido sobre a nossa macaxeira quentinha.",
    dica: "Adicione queijo coalho ou ovo cozido para caprichar no sabor final!",
  },
  {
    id: "macaxeira-carne-suina", prato: "macaxeira", categoria: "salgados", nome: "Arriégua", descricao: "Carne suína em cubos acebolada", preco: 17.99,
    descricaoLonga: "Aquele gostinho inconfundível de comida afetiva feita em casa: macaxeira cozida até ficar macia, servida com carne suína em cubos, acebolada e preparada com temperos frescos.",
    dica: "Experimente adicionar queijo muçarela derretido.",
  },
  {
    id: "macaxeira-carne-de-sol", prato: "macaxeira", categoria: "salgados", nome: "Fulô de Mandacaru", descricao: "Carne de sol em cubos acebolada na manteiga de garrafa", preco: 15.99,
    descricaoLonga: "Forte e marcante como o Sertão: macaxeira bem macia, servida com uma generosa porção de carne de sol artesanal em cubos e acebolada.",
    dica: "Adicione queijo coalho e mude o seu dia!",
  },
  {
    id: "macaxeira-cartola", prato: "macaxeira", categoria: "doces", nome: "Luar do Sertão", descricao: "Banana frita, queijo coalho, açúcar e canela", preco: 17.99,
    descricaoLonga: "Uma releitura surpreendente e iluminada da nossa sobremesa mais famosa. Macaxeira dourada e cozida, servida com fatias de banana frita, queijo coalho derretido e finalizada com açúcar e canela.",
  },
  {
    id: "macaxeira-romeu-e-julieta", prato: "macaxeira", categoria: "doces", nome: "Xodózin", descricao: "Queijo coalho com goiabada cascão derretida", preco: 17.99,
    descricaoLonga: "Aquele abraço quente entre o doce e o salgado: macaxeira quentinha, que desmancha na boca, com o sabor marcante do queijo coalho e o toque cremoso da goiabada cascão.",
  },

  // ---------- Bebidas ----------
  { id: "coca-cola", categoria: "bebidas", nome: "Coca-Cola 350 ml", descricao: "Refrigerante em lata · 350 ml", preco: 5.99 },
  { id: "guarana-antartica", categoria: "bebidas", nome: "Guaraná Antarctica", descricao: "Refrigerante em lata · 350 ml", preco: 5.99 },
  { id: "fanta-laranja", categoria: "bebidas", nome: "Fanta Laranja", descricao: "Refrigerante em lata · 350 ml", preco: 5.99 },
  { id: "agua-mineral", categoria: "bebidas", nome: "Água mineral sem gás", descricao: "Garrafa PET · 500 ml", preco: 2.99 },
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
export const destaquesHome = ["carne-de-sol", "macaxeira-frango", "macaxeira-carne-suina", "salsicha-ao-molho"];

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
  whatsapp: "5582991520132",
  telefoneExibicao: "(82) 99152-0132",
  /** Instagram da casa (só o nome de usuário, sem @) */
  instagram: "cuscuzdecasaoficial",
  /** Dias de funcionamento, por extenso (vem de entrega.ts) */
  diasFuncionamento: TEXTO_DIAS,
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

/** Adicionais do Detalhe do item, com preços definidos por ingrediente. */
export const adicionais: Adicional[] = [
  { id: "queijo-coalho", nome: "Queijo coalho", preco: 5 },
  { id: "requeijao", nome: "Requeijão", preco: 5 },
  { id: "mussarela", nome: "Muçarela", preco: 5 },
  { id: "ovo-mexido", nome: "Ovo mexido", preco: 2 },
  { id: "ovo-cozido", nome: "Ovo cozido", preco: 2 },
  { id: "banana-frita", nome: "Banana frita", preco: 2 },
];

/** Categorias que aceitam adicionais (suposição: só os salgados). */
const categoriasComAdicionais: CategoriaId[] = ["salgados"];
export const aceitaAdicionais = (p: Produto) => categoriasComAdicionais.includes(p.categoria);

export interface Acompanhamento {
  id: string;
  nome: string;
  descricao?: string;
}

/** Id da opção para quem não quer acompanhamento (a escolha é obrigatória; esta é a saída). */
export const SEM_ACOMPANHAMENTO = "sem-acompanhamento";

/** Acompanhamento obrigatório dos salgados (o cliente escolhe um, ou "Sem acompanhamento"). */
export const acompanhamentos: Acompanhamento[] = [
  { id: "vinagrete",
    nome: "Vinagrete da casa",
  descricao: "Tomate, cebola, pimentão e coentro picados, temperados com tempero especial da casa." },
  {
    id: "refogado",
    nome: "Refogado especial da casa",
    descricao: "Cenoura, pimentão e repolho em tiras, levemente refogados com shoyu.",
  },
  { id: SEM_ACOMPANHAMENTO, nome: "Sem acompanhamento" },
];
/** Suposição: só os salgados têm acompanhamento (os doces não). */
export const exigeAcompanhamento = (p: Produto) => p.categoria === "salgados";
