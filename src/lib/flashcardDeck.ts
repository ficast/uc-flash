/**
 * A pilha dos flashcards, sem tela: montar a seleção, responder certo/errado e o resumo do fim.
 * O mesmo funcionamento do baralho original (artifact "Flashcards Deutsch A1"): o card errado volta para a pilha
 * numa posição sorteada, nunca como o próximo; o mesmo vocábulo na outra direção não vem logo depois.
 */
import type { FlashCard, FlashDeck } from './types'

/** d = alemão → português (vê a palavra), p = português → alemão (vê a tradução). */
export type CardDir = 'd' | 'p'
export type DirChoice = 'both' | 'de-pt' | 'pt-de'
/** Um card: `<lista>:<índice>:<direção>`. */
export type CardKey = string

export interface PileState {
  pile: CardKey[]
  total: number
  /** Erros por card. */
  errs: Record<CardKey, number>
  wrong: number
  removed: number
}

export const dirsFor = (choice: DirChoice): CardDir[] =>
  choice === 'both' ? ['d', 'p'] : [choice === 'de-pt' ? 'd' : 'p']

export function selection(deck: FlashDeck, lists: string[], choice: DirChoice): CardKey[] {
  const out: CardKey[] = []
  for (const l of deck.lists) {
    if (!lists.includes(l.key)) continue
    l.cards.forEach((_, i) => dirsFor(choice).forEach((d) => out.push(`${l.key}:${i}:${d}`)))
  }
  return out
}

export function cardOf(deck: FlashDeck, key: CardKey): { card: FlashCard; dir: CardDir } {
  const [list, i, dir] = key.split(':')
  const l = deck.lists.find((x) => x.key === list)!
  return { card: l.cards[Number(i)], dir: dir as CardDir }
}

/** O mesmo vocábulo em outra direção. */
const sibling = (a: CardKey, b: CardKey) => a !== b && a.slice(0, a.lastIndexOf(':')) === b.slice(0, b.lastIndexOf(':'))

function shuffle<T>(xs: T[], rng: () => number): T[] {
  const a = xs.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function startPile(keys: CardKey[], rng: () => number = Math.random): PileState {
  return { pile: shuffle(keys, rng), total: keys.length, errs: {}, wrong: 0, removed: 0 }
}

/** Responde o card do topo: certo sai; errado volta numa posição sorteada (nunca a próxima). */
export function answer(s: PileState, ok: boolean, rng: () => number = Math.random): PileState {
  const [id, ...rest] = s.pile
  if (id === undefined) return s
  const pile = rest.slice()
  const errs = { ...s.errs }
  let { wrong, removed } = s
  if (ok) {
    removed++
  } else {
    errs[id] = (errs[id] ?? 0) + 1
    wrong++
    if (pile.length === 0) pile.push(id)
    else pile.splice(1 + Math.floor(rng() * pile.length), 0, id)
  }
  // O mesmo vocábulo na outra direção logo em seguida entregaria a resposta: troca por outro card.
  if (pile.length > 2 && sibling(pile[0], id)) {
    const j = pile.findIndex((k, i) => i > 0 && k !== id && !sibling(k, id))
    if (j > 0) [pile[0], pile[j]] = [pile[j], pile[0]]
  }
  return { ...s, pile, errs, wrong, removed }
}

export interface PileSummary {
  total: number
  firstTry: number
  /** Cards errados, dos mais errados para os menos. */
  missed: { key: CardKey; times: number }[]
  wrong: number
}

export function summary(s: PileState): PileSummary {
  const missed = Object.entries(s.errs).sort((a, b) => b[1] - a[1]).map(([key, times]) => ({ key, times }))
  return { total: s.total, firstTry: s.total - missed.length, missed, wrong: s.wrong }
}

/** Partes de uma forma alemã ("der Lehrer, - / die Lehrerin, -nen") com o gênero do artigo de cada uma. */
export function genderParts(de: string): { text: string; gender: 'm' | 'f' | 'n' | null }[] {
  const G = { der: 'm', die: 'f', das: 'n' } as const
  return de.split(' / ').map((text) => {
    const m = text.match(/^(der|die|das)(\s|$)/)
    return { text, gender: m ? G[m[1] as keyof typeof G] : null }
  })
}
