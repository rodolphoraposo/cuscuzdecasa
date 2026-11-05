import { useEffect } from "react";

/** Páginas que não devem aparecer no Google (pedido, 404, referência interna). */
export function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}
