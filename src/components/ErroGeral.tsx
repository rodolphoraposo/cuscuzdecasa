import { Component, type ErrorInfo, type ReactNode } from "react";

/** Última rede de proteção: se uma tela quebrar, o cliente vê uma saída em vez de uma página em branco. */
export class ErroGeral extends Component<{ children: ReactNode }, { erro: boolean }> {
  state = { erro: false };

  static getDerivedStateFromError() {
    return { erro: true };
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    console.error(erro, info.componentStack);
  }

  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <main className="container section" role="alert">
        <h1 className="t-pagina">Algo deu errado</h1>
        <p className="t-corpo" style={{ margin: "var(--esp-16) 0 var(--esp-24)" }}>
          Não conseguimos mostrar esta tela. Volte ao início e tente de novo; se continuar, chame a gente no WhatsApp.
        </p>
        {/* link comum (recarrega a página): zera o estado do erro */}
        <a className="btn btn--primary btn--md" href="/">Voltar ao início</a>
      </main>
    );
  }
}
