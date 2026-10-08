/** Os textos da interface, em português europeu. */

/** "1 cartão" / "2 cartões". */
const cards = (n: number) => `${n} ${n === 1 ? 'cartão' : 'cartões'}`

export const T = {
  title: 'Flashcards',
  empty: 'Nenhum baralho disponível.',
  menu: 'Menu',
  lists: 'Listas',
  cards,
  direction: 'Direção',
  dir: {
    both: 'Os dois',
    'de-pt': 'Alemão → português',
    'pt-de': 'Português → alemão',
  },
  dirHint: {
    both: 'cada palavra dá dois cartões, um em cada direção',
    'de-pt': 'vês a palavra, lembras a tradução',
    'pt-de': 'vês a tradução, lembras a palavra e o artigo',
  },
  dirShort: { d: 'DE → PT', p: 'PT → DE' },
  colors: 'Cores',
  gender: { m: 'masculino', f: 'feminino', n: 'neutro', x: 'outras, sem género' },
  start: (n: number) => `Começar com ${cards(n)}`,
  resume: (n: number) => `Continuar onde parei (${cards(n)} no monte)`,
  pickList: 'Escolhe pelo menos uma lista',
  left: 'No monte',
  right: 'Certas',
  wrong: 'Erros',
  flip: 'Virar',
  ok: 'Certo',
  bad: 'Errado',
  plural: 'Plural',
  keys: 'Atalhos: V vira, seta para a direita acerta, seta para a esquerda erra',
  done: 'Monte terminado',
  summary: (s: { total: number; first: number; missed: number; wrong: number }) =>
    `${cards(s.total)}: ${s.first} à primeira, ${s.missed} com pelo menos um erro, ${s.wrong} ${s.wrong === 1 ? 'erro' : 'erros'} no total.`,
  missedList: 'Cartões errados',
  missedTimes: (n: number) => `${n}×`,
  again: 'Recomeçar a mesma seleção',
  onlyMissed: 'Praticar só as que errei',
  all: 'Todas',
  none: 'Limpar',
  localNote: 'O progresso fica guardado só neste aparelho e neste navegador.',
}

/** Como instalar a app no telemóvel (rodapé). */
export const INSTALL = {
  title: 'Instalar no telemóvel',
  intro: 'Instalada, a app abre em ecrã inteiro a partir do ícone e funciona sem internet.',
  ios: {
    name: 'iPhone (Safari)',
    steps: ['Abre esta página no Safari.', 'Toca em Partilhar (o quadrado com a seta para cima).',
      'Escolhe "Adicionar ao ecrã principal" e toca em Adicionar.'],
  },
  android: {
    name: 'Android (Chrome)',
    steps: ['Abre esta página no Chrome.', 'Toca no menu ⋮ (canto superior direito).',
      'Escolhe "Instalar app" (ou "Adicionar ao ecrã principal") e confirma.'],
  },
}
