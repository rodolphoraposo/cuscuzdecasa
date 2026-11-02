import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { aceitaAdicionais, adicionais, contato, formatarPreco, produtos, type Produto } from "../data/menu";

export const MAX_QTD = 99;
const STORAGE_KEY = "cuscuz-pedido-v2";

interface Salvo { id: string; qtd: number; extras: string[] }

export interface LinhaPedido {
  chave: string;
  produto: Produto;
  quantidade: number;
  extras: string[];
  precoUnitario: number;
  subtotal: number;
}

interface CartValue {
  linhas: LinhaPedido[];
  totalItens: number;
  totalPreco: number;
  quantidadeSimples: (id: string) => number;
  adicionar: (id: string, extras?: string[], qtd?: number) => void;
  alterar: (chave: string, delta: number) => void;
  limpar: () => void;
  linkWhatsApp: () => string;
}

export const chaveDe = (id: string, extras: string[]) => `${id}|${extras.join(",")}`;

/** Mantém só adicionais que existem no catálogo e que o produto aceita, sem repetição e em ordem fixa. */
function normalizar(produto: Produto, extras: unknown[]): string[] {
  if (!aceitaAdicionais(produto)) return [];
  return adicionais.filter((a) => extras.includes(a.id)).map((a) => a.id);
}

/** O localStorage é entrada não confiável: valida formato, ids e quantidades. */
function carregar(): Salvo[] {
  try {
    const bruto: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(bruto)) return [];
    const vistos = new Set<string>();
    return bruto.flatMap((item): Salvo[] => {
      if (typeof item !== "object" || item === null) return [];
      const { id, qtd, extras } = item as Record<string, unknown>;
      const produto = produtos.find((p) => p.id === id);
      if (!produto || typeof qtd !== "number" || !Number.isInteger(qtd) || qtd < 1) return [];
      const lista = normalizar(produto, Array.isArray(extras) ? extras : []);
      const chave = chaveDe(produto.id, lista);
      if (vistos.has(chave)) return [];
      vistos.add(chave);
      return [{ id: produto.id, qtd: Math.min(qtd, MAX_QTD), extras: lista }];
    });
  } catch {
    return [];
  }
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [salvos, setSalvos] = useState<Salvo[]>(carregar);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salvos));
    } catch {
      /* armazenamento indisponível: segue só em memória */
    }
  }, [salvos]);

  const value = useMemo<CartValue>(() => {
    const linhas = salvos.flatMap((s): LinhaPedido[] => {
      const produto = produtos.find((p) => p.id === s.id);
      if (!produto) return [];
      const centavos = Math.round(produto.preco * 100) + s.extras.reduce((t, e) => t + Math.round((adicionais.find((a) => a.id === e)?.preco ?? 0) * 100), 0);
      return [{ chave: chaveDe(s.id, s.extras), produto, quantidade: s.qtd, extras: s.extras, precoUnitario: centavos / 100, subtotal: (centavos * s.qtd) / 100 }];
    });
    const totalItens = linhas.reduce((t, l) => t + l.quantidade, 0);
    const totalPreco = linhas.reduce((t, l) => t + Math.round(l.subtotal * 100), 0) / 100;

    return {
      linhas,
      totalItens,
      totalPreco,
      quantidadeSimples: (id) => salvos.find((s) => s.id === id && s.extras.length === 0)?.qtd ?? 0,
      adicionar: (id, extras = [], qtd = 1) => {
        const produto = produtos.find((p) => p.id === id);
        if (!produto) return;
        const lista = normalizar(produto, extras);
        const chave = chaveDe(id, lista);
        setSalvos((atual) =>
          atual.some((s) => chaveDe(s.id, s.extras) === chave)
            ? atual.map((s) => (chaveDe(s.id, s.extras) === chave ? { ...s, qtd: Math.min(s.qtd + qtd, MAX_QTD) } : s))
            : [...atual, { id, qtd: Math.min(Math.max(qtd, 1), MAX_QTD), extras: lista }],
        );
      },
      alterar: (chave, delta) =>
        setSalvos((atual) =>
          atual.flatMap((s) => {
            if (chaveDe(s.id, s.extras) !== chave) return [s];
            const qtd = Math.min(s.qtd + delta, MAX_QTD);
            return qtd < 1 ? [] : [{ ...s, qtd }];
          }),
        ),
      limpar: () => setSalvos([]),
      linkWhatsApp: () => {
        const texto = linhas.map((l) => {
          const nomes = l.extras.map((e) => adicionais.find((a) => a.id === e)?.nome).join(", ");
          return `${l.quantidade}x ${l.produto.nome}${nomes ? ` (+ ${nomes})` : ""} - ${formatarPreco(l.subtotal)}`;
        });
        const msg = `Olá! Quero fazer um pedido:\n${texto.join("\n")}\n\nTotal: ${formatarPreco(totalPreco)}`;
        return `https://wa.me/${contato.whatsapp}?text=${encodeURIComponent(msg)}`;
      },
    };
  }, [salvos]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
