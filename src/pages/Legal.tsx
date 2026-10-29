export default function Legal({ titulo }: { titulo: string }) {
  return (
    <section className="section container" style={{ minHeight: "50vh" }}>
      <h1 className="t-pagina">{titulo}</h1>
      <p className="t-corpo" style={{ marginTop: "var(--esp-16)", color: "var(--texto-secundario)" }}>
        Conteúdo em preparação.
      </p>
    </section>
  );
}
