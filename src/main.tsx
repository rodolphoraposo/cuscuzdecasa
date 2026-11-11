import { StrictMode } from "react";
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErroGeral>
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </ErroGeral>
  </StrictMode>,
);
