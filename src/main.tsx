import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ErroGeral } from "./components/ErroGeral";
import { CartProvider } from "./context/CartContext";
import { iniciarAnalytics } from "./lib/analytics";
import "./styles/base.css";
import "./styles/ui.css";
import "./styles/components.css";

iniciarAnalytics();

function AppInicial() {
  useEffect(() => {
    document.getElementById("startup-loader")?.remove();
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch((erro: unknown) => {
      console.error("Não foi possível registrar o service worker do aplicativo.", erro);
    });
  }, []);

  return (
    <ErroGeral>
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </ErroGeral>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppInicial />
  </StrictMode>,
);
