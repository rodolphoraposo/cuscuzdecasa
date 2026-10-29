import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Rola para o topo a cada página nova e respeita âncoras como /#como-funciona. */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}
