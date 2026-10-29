# Cuscuz de Casa

Site com cardápio digital. Vite + React + TypeScript + React Router.

## Rodar localmente
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera /dist
```

## Estrutura
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
- Fotos de Carne Moída, Salsicha, Romeu & Julieta e bebidas são recortes dos prints (baixa resolução). Substitua por originais em `src/assets/img/` mantendo os nomes.
- Preços da Home no Figma diferem do cardápio; o site usa os preços do cardápio.
- Tema escuro: provisório, o Figma ainda não define.
- Páginas de Privacidade e Termos: placeholders.
