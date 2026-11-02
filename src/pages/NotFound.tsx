import { EmptyState, ButtonLink } from "../components/ui";
import { usePageTitle } from "../hooks/usePageTitle";

export default function NotFound() {
  usePageTitle("Página não encontrada");
  return (
    <section className="section container">
      <EmptyState
        titulo="Página não encontrada"
        texto="Esse endereço não existe ou foi movido. Volte ao início ou veja o cardápio."
        acao={<ButtonLink to="/cardapio">Ver cardápio</ButtonLink>}
      />
    </section>
  );
}
