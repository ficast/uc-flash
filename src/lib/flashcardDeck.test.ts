import { answer, cardOf, genderParts, selection, startPile, summary } from './flashcardDeck'
import type { FlashDeck } from './types'

const card = (de: string, pt: string) => ({ de, ipa: '', pt, plural: '', nota: '', sec: '1A' })
const DECK: FlashDeck = { key: 'd', title: 'D', language: 'de', support_language: 'pt', lists: [
  { key: 'l1', title: 'L1', cards: [card('der Kurs', 'o curso'), card('die Frage', 'a pergunta'), card('das Foto', 'a foto')] },
  { key: 'l2', title: 'L2', cards: [card('gehen', 'ir')] },
] }

// Sorteio previsível: sempre o meio do intervalo.
const half = () => 0.5

test('seleção por listas e direção', () => {
  expect(selection(DECK, ['l1'], 'de-pt')).toEqual(['l1:0:d', 'l1:1:d', 'l1:2:d'])
  expect(selection(DECK, ['l1', 'l2'], 'both')).toHaveLength(8)
  expect(selection(DECK, [], 'both')).toEqual([])
  expect(cardOf(DECK, 'l2:0:p')).toEqual({ card: DECK.lists[1].cards[0], dir: 'p' })
})

test('certo sai da pilha; errado volta, nunca como o próximo', () => {
  let s = startPile(['a:0:d', 'a:1:d', 'a:2:d', 'a:3:d'], half)
  const first = s.pile[0]
  s = answer(s, false, half)
  expect(s.pile).toHaveLength(4)
  expect(s.pile[0]).not.toBe(first)
  expect(s.errs[first]).toBe(1)
  s = answer(s, true, half)
  expect(s.pile).toHaveLength(3)
  expect(s.removed).toBe(1)
})

test('o mesmo vocábulo na outra direção não vem logo depois', () => {
  // pilha arrumada à mão: depois de responder l1:0:d, o próximo seria o irmão l1:0:p
  const s = answer({ pile: ['l1:0:d', 'l1:0:p', 'l1:1:d', 'l1:2:d'], total: 4, errs: {}, wrong: 0, removed: 0 }, true, half)
  expect(s.pile[0]).not.toBe('l1:0:p')
  expect(s.pile).toHaveLength(3)
})

test('resumo: de primeira, com erro e total de erros', () => {
  let s = startPile(['a:0:d', 'a:1:d', 'a:2:d'], half)
  const missed = s.pile[0]
  s = answer(s, false, half)
  while (s.pile.length) s = answer(s, true, half)
  expect(summary(s)).toEqual({ total: 3, firstTry: 2, missed: [{ key: missed, times: 1 }], wrong: 1 })
})

test('gênero do artigo em cada parte', () => {
  expect(genderParts('der Lehrer, - / die Lehrerin, -nen').map((p) => p.gender)).toEqual(['m', 'f'])
  expect(genderParts('das Foto, -s')[0].gender).toBe('n')
  expect(genderParts('gehen')[0].gender).toBeNull()
  expect(genderParts('dieser')[0].gender).toBeNull()
})
