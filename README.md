# Flashcards de Alemão A1

O módulo de flashcards do Orbit Languages (`../assimil`) como app autónomo: sem login, sem servidor,
com o progresso guardado no próprio aparelho (`localStorage`). É uma PWA: dá para instalar no telemóvel e usar offline.

- Baralho: `src/data/de-daf-a1.json` (Lektion 1–10, 1.481 vocábulos), copiado de `assimil/api/src/assimil/flashcards/`, com as traduções adaptadas para pt-PT.
- Lógica do monte: `src/lib/flashcardDeck.ts` (igual à do assimil).
- Textos da interface (pt-PT): `src/lib/strings.ts`.

## Comandos

```sh
npm install
npm run dev      # http://localhost:5173
npm test
npm run build    # gera dist/
```

Os ícones em `public/` saem de `public/icon.svg` com `npx pwa-assets-generator`.

## Deploy no Vercel

Importar o repositório no Vercel: o preset Vite é detetado sozinho (build `npm run build`, saída `dist`).
