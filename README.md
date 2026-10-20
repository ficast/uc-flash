# Flashcards de Alemão A1, A2 e B1

Um app simples para praticar vocabulário de alemão com flashcards. Não tem login nem servidor: o progresso fica
guardado no próprio aparelho (`localStorage`). É uma PWA, por isso dá para instalar no telemóvel e usar offline.

O vocabulário segue as listas do livro **Kurs DaF** (editora Klett), com as traduções em português europeu:
**A1**, Lektionen 1 a 10 (1.481 vocábulos), **A2**, Lektionen 11 a 20 (1.514 vocábulos), e **B1**,
Lektionen 21 a 30 (1.507 vocábulos).
Cada vocábulo traz uma frase de exemplo com a tradução, mostrada no verso do cartão.

- Baralhos: `src/data/de-daf-a1.json`, `src/data/de-daf-a2.json` e `src/data/de-daf-b1.json`, registados em `src/lib/decks.ts`.
- Lógica do monte (embaralhar, certo/errado, resumo): `src/lib/flashcardDeck.ts`.
- Textos da interface: `src/lib/strings.ts`.

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

## Licença

© 2026 Filipe de Castro. Livre para uso e estudo, sob a [licença MIT](LICENSE): podes usar, copiar, modificar
e distribuir, desde que mantenhas o aviso de copyright.
