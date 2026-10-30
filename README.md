# Cuscuz de Casa

Site com cardápio digital. Vite + React + TypeScript + React Router.

## Rodar localmente
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera /dist
```

## Estrutura
- `src/styles/ui.css` – componentes da Biblioteca UI (botão, campos, controles, avisos, badge, tag, avatar, indicador, abas)
- `src/components/ui.tsx` – versões React desses componentes
- Rota `/design-system` – página de referência para conferir cada componente com o Figma
- `src/styles/tokens.css` – tokens do Design System (primitivos + semânticos, sombras, raios, espaçamento, grid)
- `src/styles/base.css` – reset, escala tipográfica e layout
- `src/styles/components.css` – estilos dos componentes
- `src/data/menu.ts` – produtos, preços, condomínios e contato (edite aqui)
- `src/pages/` – Home e Cardápio
- `src/components/` – Header, Footer, ProductItem, OrderControl, CartBar

## Publicar
1. `git init && git add . && git commit -m "Primeira versão"`
2. `git branch -M main && git remote add origin <URL-DO-REPO> && git push -u origin main`
3. Vercel → Add New → Project → importe o repositório (preset Vite é detectado sozinho) → Deploy.
4. Vercel → Settings → Domains → adicione seu domínio e copie os registros DNS indicados para o painel onde o domínio foi comprado.

`vercel.json` já reescreve todas as rotas para `index.html` (necessário para `/cardapio` funcionar ao recarregar a página).

## Pendências conhecidas
- Fotos: todas preenchem o quadro (object-fit: cover). Se alguma bebida ficar muito cortada, ajuste o enquadramento da imagem no Figma.
- Preços da Home no Figma diferem do cardápio; o site usa os preços do cardápio.
- Logotipo: só existe a versão escura; no tema escuro ele aparece sobre um fundo creme. Falta exportar uma versão clara.
- Páginas de Privacidade e Termos: placeholders.
