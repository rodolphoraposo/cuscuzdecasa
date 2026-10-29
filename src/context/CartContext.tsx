import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { contato, formatarPreco, produtos } from "../data/menu";

type Quantidades = Record<string, number>;

interface CartValue {
  quantidades: Quantidades;
  totalItens: number;
  totalPreco: number;
  adicionar: (id: string) => void;
  remover: (id: string) => void;
  linkWhatsApp: () => string;
}

const CartContext = createContext<CartValue | null>(null);
const STORAGE_KEY = "cuscuz-pedido";

function carregar(): Quantidades {
  try {
    const bruto = localStorage.getItem(STORAGE_KEY);
    return bruto ? (JSON.parse(bruto) as Quantidades) : {};
  } catch {
    return {};
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [quantidades, setQuantidades] = useState<Quantidades>(carregar);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quantidades));
    } catch {
      /* armazenamento indisponível: segue só em memória */
    }
  }, [quantidades]);

  const value = useMemo<CartValue>(() => {
    const itens = produtos.filter((p) => (quantidades[p.id] ?? 0) > 0);
    const totalItens = itens.reduce((s, p) => s + quantidades[p.id], 0);
    const totalPreco = itens.reduce((s, p) => s + quantidades[p.id] * p.preco, 0);

    return {
      quantidades,
      totalItens,
      totalPreco,
      adicionar: (id) => setQuantidades((q) => ({ ...q, [id]: (q[id] ?? 0) + 1 })),
      remover: (id) =>
        setQuantidades((q) => {
          const { [id]: atual = 0, ...resto } = q;
          return atual > 1 ? { ...resto, [id]: atual - 1 } : resto;
        }),
      linkWhatsApp: () => {
        const linhas = itens.map((p) => `${quantidades[p.id]}x ${p.nome} - ${formatarPreco(p.preco * quantidades[p.id])}`);
        const texto = `Olá! Quero fazer um pedido:\n${linhas.join("\n")}\n\nTotal: ${formatarPreco(totalPreco)}`;
        return `https://wa.me/${contato.whatsapp}?text=${encodeURIComponent(texto)}`;
      },
    };
  }, [quantidades]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
