import { Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ScrollManager } from "./components/ScrollManager";
import DesignSystem from "./pages/DesignSystem";
import Home from "./pages/Home";
import Legal from "./pages/Legal";
import Finalizar from "./pages/Finalizar";
import Menu from "./pages/Menu";
import Pedido from "./pages/Pedido";
import ProductDetail from "./pages/ProductDetail";

export default function App() {
  const { pathname } = useLocation();
  /** Detalhe, carrinho e finalização são telas focadas, sem o menu do site. */
  const fluxoDePedido = pathname.startsWith("/cardapio/") || pathname.startsWith("/pedido");

  return (
    <>
      <ScrollManager />
      {!fluxoDePedido && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cardapio" element={<Menu />} />
          <Route path="/cardapio/:id" element={<ProductDetail />} />
          <Route path="/pedido" element={<Pedido />} />
          <Route path="/pedido/finalizar" element={<Finalizar />} />
          <Route path="/design-system" element={<DesignSystem />} />
          <Route path="/privacidade" element={<Legal titulo="Política de Privacidade" />} />
          <Route path="/termos" element={<Legal titulo="Termos de Uso" />} />
          <Route path="*" element={<Legal titulo="Página não encontrada" />} />
        </Routes>
      </main>
      {!fluxoDePedido && <Footer />}
    </>
  );
}
