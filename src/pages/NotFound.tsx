import { ButtonLink, EmptyState } from "../components/ui";
import { usePageTitle } from "../hooks/usePageTitle";
import { useNoIndex } from "../hooks/useNoIndex";

export default function NotFound() {
  usePageTitle("Página não encontrada");
  useNoIndex();
  return (
    <section className="section container">
      <EmptyState
          nivel={1}
        titulo="Página não encontrada"
        texto="Não encontramos essa página. Escolha para onde quer ir."
        acao={
          <div className="notfound__acoes">
            <ButtonLink to="/cardapio">Ver cardápio</ButtonLink>
            <ButtonLink to="/" variante="outline">Ir para o início</ButtonLink>
          </div>
        }
      />
    </section>
  );
}
