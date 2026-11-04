import icone from "../assets/logo/logo-icon.webp";
import type { Produto } from "../data/menu";

/** Foto do produto; sem foto, mostra um aviso discreto em vez de uma imagem quebrada ou de outro prato. */
export function FotoProduto({ produto, decorativa = false, lazy = true, className }: {
  produto: Produto;
  decorativa?: boolean;
  lazy?: boolean;
  className?: string;
}) {
  if (produto.imagem) {
    return <img className={className} src={produto.imagem} alt={decorativa ? "" : produto.nome} loading={lazy ? "lazy" : undefined} />;
  }
  return (
    <div className={`foto-pendente${className ? ` ${className}` : ""}`} role={decorativa ? undefined : "img"} aria-label={decorativa ? undefined : `Foto de ${produto.nome} em breve`} aria-hidden={decorativa || undefined}>
      <img src={icone} alt="" />
      <span>Foto em breve</span>
    </div>
  );
}
