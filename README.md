# Cuscuz de Casa · cardápio digital

Cardápio e pedido online da Cuscuz de Casa (Maceió/AL). O cliente monta o pedido, informa a entrega e envia uma **comanda pelo WhatsApp**.

**Stack:** Vite 8 · React 18 · TypeScript · React Router 7 · Phosphor Icons · Vitest. Deploy na Vercel.
**Precisa de Node 22.12 ou mais novo** (`node -v`). Na Vercel: Project Settings → Node.js Version → 22.x.

```bash
npm install
npm run dev      # desenvolvimento (http://localhost:5173)
npm test         # testes automáticos
npm run build    # verificação de tipos + build de produção
```

## Onde editar cada coisa

| O que muda | Onde |
| --- | --- |
| Pratos, descrições, dicas, **preços**, fotos | `src/data/menu.ts` (lista `produtos`) |
| Adicionais ("Capriche seu prato") e acompanhamentos | `src/data/menu.ts` (`adicionais`, `acompanhamentos`) |
| **Número do WhatsApp**, telefone exibido, taxa de entrega | `src/data/menu.ts` (`contato`, `taxaEntrega`) |
| Dados da empresa nos Termos e na Privacidade (CPF/CNPJ, e-mail) | `src/data/empresa.ts` |
| Horário limite, janelas de entrega, **o que acontece depois das 16h** | `src/lib/entrega.ts` (`APOS_O_LIMITE`: `"bloquear"` ou `"amanha"`) |
| Formato da comanda do WhatsApp e número do pedido (`#0000`) | `src/lib/comanda.ts` |
| Formas de pagamento | `src/pages/Pedido.tsx` (`FORMAS`) e `src/lib/comanda.ts` |
| Cores, tipografia, espaçamentos (tokens do Figma) | `src/styles/tokens.css` |
| Fotos dos pratos / logos usadas no site | `src/assets/produtos/`, `src/assets/logo/` |
| Pacote completo de logos (não vai para o site) | `design/logo/` |

Ao trocar fotos, mantenha o formato `.webp` e importe no `menu.ts`. Um produto sem foto mostra "Foto em breve".

## Estrutura

```
src/
  components/  peças reutilizáveis (Header, Footer, ui.tsx, PreviaComanda, ...)
  context/     carrinho (CartContext) e tema
  data/        cardápio, contato e dados da empresa
  hooks/       título da página, noindex, regra de entrega
  lib/         regras puras e testadas: comanda, CEP (ViaCEP), formulário, entrega, navegação
  pages/       telas (Home, Menu, ProductDetail, Pedido, Finalizar, PedidoEnviado, Termos, Privacidade)
  styles/      tokens, base, componentes
design/logo/   pacote de logos
scripts/       csp-hash.mjs
```

## Fluxo do cliente

Início → Cardápio (Cuscuz ou Macaxeira → salgados/doces/bebidas) → Detalhe (acompanhamento, adicionais, quantidade) → sugestão de bebida → Seu pedido (dados, CEP, horário, pagamento, troco) → Resumo com a prévia da comanda → WhatsApp → Agradecimento.

## Segurança e privacidade

- **CSP e demais cabeçalhos** em `vercel.json` (sem estilos soltos, sem scripts de terceiros). O único script em linha é o do tema em `index.html`, liberado por hash. **Se mudar esse script**, rode `node scripts/csp-hash.mjs` e troque o hash no `vercel.json`.
- Só o ViaCEP (`viacep.com.br`) pode receber chamadas do navegador, e só com o CEP.
- Dados pessoais ficam apenas no `sessionStorage` (somem ao fechar a aba). O carrinho fica no `localStorage`. Tudo que é lido de lá é validado.
- Textos digitados pelo cliente passam por limpeza antes de entrar na comanda (sem como quebrar a formatação do WhatsApp).
- Sem cookies, sem analytics, fontes servidas pelo próprio site.

## Testes

`npm test` cobre: comanda (formato, alinhamento, limpeza do texto), CEP (incluindo falhas), validação do formulário, regra de entrega e horários, o fluxo completo do pedido, navegação (origem segura), menu e abas por teclado, páginas legais, 404 e tela de erro. Os testes fixam o relógio em 15h (Maceió), então não dependem da hora em que rodam.

## Antes de vender

- [ ] Preencher CPF/CNPJ e e-mail em `src/data/empresa.ts` e pedir revisão profissional dos Termos e da Privacidade.
- [ ] Atualizar o número do WhatsApp em `contato` (`menu.ts`).
- [ ] Macaxeira: confirmar preços e colocar as fotos.
- [ ] Decidir a forma de pagamento "Cartão na entrega" (hoje ela aparece no pedido).
- [ ] Confirmar `APOS_O_LIMITE` em `entrega.ts`.
- [ ] Fazer um pedido de teste real até o WhatsApp (comanda em fonte monoespaçada) e compartilhar o link para conferir a prévia (Open Graph).
- [ ] Conferir em um celular de verdade e abrir o site publicado verificando o console do navegador.
- [ ] O número do pedido (`#0000`) é provisório e não é sequencial: troque `numeroPedido` quando houver contador (Operatta/Supabase).
