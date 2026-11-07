import { Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { useFocoLivreDaBarra } from "./hooks/useFocoLivreDaBarra";
import { ScrollManager } from "./components/ScrollManager";
import DesignSystem from "./pages/DesignSystem";
import Home from "./pages/Home";
import Finalizar from "./pages/Finalizar";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import Pedido from "./pages/Pedido";
import PedidoEnviado from "./pages/PedidoEnviado";
import Privacidade from "./pages/Privacidade";
import Termos from "./pages/Termos";
import ProductDetail from "./pages/ProductDetail";

export default function App() {
  const { pathname } = useLocation();
  useFocoLivreDaBarra();
  /** Detalhe, carrinho e finalização são telas focadas, sem o menu do site. */
  const fluxoDePedido = pathname.startsWith("/cardapio/") || pathname.startsWith("/pedido");

  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <ScrollManager />
      {!fluxoDePedido && <Header />}
      <main id="conteudo" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cardapio" element={<Menu />} />
          <Route path="/cardapio/:id" element={<ProductDetail />} />
          <Route path="/pedido" element={<Pedido />} />
          <Route path="/pedido/finalizar" element={<Finalizar />} />
          <Route path="/pedido/enviado" element={<PedidoEnviado />} />
          <Route path="/design-system" element={<DesignSystem />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!fluxoDePedido && <Footer />}
    </>
  );
}
