/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** ID de métrica do Google Analytics 4 (G-XXXXXXXXXX). Se vazio, usa o ID do fluxo "Cuscuz de Casa". */
  readonly VITE_GA_ID?: string;
}
