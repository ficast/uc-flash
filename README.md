# Flashcards de Alemão A1

Um app simples para praticar vocabulário de alemão com flashcards. Não tem login nem servidor: o progresso fica
guardado no próprio aparelho (`localStorage`). É uma PWA, por isso dá para instalar no telemóvel e usar offline.

O vocabulário segue as listas das Lektionen 1 a 10 do livro **Kurs DaF A1** (editora Klett), com 1.481 vocábulos
e as traduções em português europeu.

- Baralho: `src/data/de-daf-a1.json`.
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
