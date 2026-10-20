import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FlashcardsPage } from './FlashcardsPage'
import { pileKey } from '@/hooks/usePileStore'
import { DECKS } from '@/lib/decks'
import type { FlashDeck } from '@/lib/types'

const card = (de: string, pt: string, sec = '1A') => ({ de, ipa: 'ipa', pt, plural: '', nota: '', sec })
const DECK: FlashDeck = { key: 'de-daf-a1', title: 'Kurs DaF A1', language: 'de', support_language: 'pt', lists: [
  { key: 'lektion-1', title: 'Lektion 1', cards: [card('der Kurs, -e', 'o curso'), card('die Frage, -n', 'a pergunta')] },
  { key: 'lektion-2', title: 'Lektion 2', cards: [card('das Buch, ⸚er', 'o livro', '2A')] },
] }
const page = () => render(<FlashcardsPage decks={[DECK]} />)
const stored = () => JSON.parse(localStorage.getItem(pileKey(DECK.key)) ?? 'null') as { pile: string[] } | null

test('os baralhos incluídos: A1 (Lektion 1 a 10, 1.481 vocábulos), A2 (11 a 20, 1.514) e B1 (21 a 30, 1.507)', () => {
  const [a1, a2, b1] = DECKS
  expect(a1.lists.map((l) => l.title)).toEqual(Array.from({ length: 10 }, (_, i) => `Lektion ${i + 1}`))
  expect(a1.lists.reduce((n, l) => n + l.cards.length, 0)).toBe(1481)
  expect(a2.lists.map((l) => l.title)).toEqual(Array.from({ length: 10 }, (_, i) => `Lektion ${i + 11}`))
  expect(a2.lists.reduce((n, l) => n + l.cards.length, 0)).toBe(1514)
  expect(b1.lists.map((l) => l.title)).toEqual(Array.from({ length: 10 }, (_, i) => `Lektion ${i + 21}`))
  expect(b1.lists.reduce((n, l) => n + l.cards.length, 0)).toBe(1507)
  expect([a2, b1].every((d) => d.lists.every((l) => l.cards.every((c) => c.sec.startsWith(l.key.slice('lektion-'.length)))))).toBe(true)
  // Todos os cartões dos três livros trazem a frase de exemplo com a tradução.
  expect(DECKS.every((d) => d.lists.every((l) => l.cards.every((c) => c.ex?.trim() && c.ex_pt?.trim())))).toBe(true)
})

test('escolha: começa na primeira lista; Todas, Limpar, direção e a escolha lembrada', async () => {
  const { unmount } = page()
  expect(screen.getByRole('button', { name: 'Começar com 4 cartões' })).toBeEnabled()
  expect(screen.getByText('Podes escolher uma lista ou várias ao mesmo tempo.')).toBeInTheDocument()
  expect(screen.getByText(/Os cartões certos saem do monte/)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Todas' }))
  expect(screen.getByRole('button', { name: 'Começar com 6 cartões' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /Alemão → português/ }))
  expect(screen.getByRole('button', { name: 'Começar com 3 cartões' })).toBeInTheDocument()
  unmount()
  page() // de volta: a mesma escolha
  expect(screen.getByRole('button', { name: 'Começar com 3 cartões' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Limpar' }))
  expect(screen.getByRole('button', { name: 'Escolhe pelo menos uma lista' })).toBeDisabled()
})

test('praticar: virar, errar (volta para o monte), acertar, resumo e só as erradas', async () => {
  page()
  await userEvent.click(screen.getByRole('button', { name: /Alemão → português/ })) // só a Lektion 1: 2 cartões
  await userEvent.click(screen.getByRole('button', { name: 'Começar com 2 cartões' }))
  const stats = screen.getByTestId('fc-stats')
  expect(stats).toHaveTextContent('No monte 2')
  expect(screen.getByRole('button', { name: /Certo/ })).toBeDisabled()
  expect(screen.getByText(/Errado: volta a aparecer mais à frente/)).toBeInTheDocument()
  // artigo na cor do género
  expect(within(screen.getByTestId('fc-card')).getByText(/^(der Kurs|die Frage)/).dataset.gender).toMatch(/^[mf]$/)
  await userEvent.click(screen.getByRole('button', { name: 'Virar' }))
  expect(screen.getByTestId('fc-answer')).toHaveTextContent(/o curso|a pergunta/)
  await userEvent.click(screen.getByRole('button', { name: /Errado/ }))
  expect(stats).toHaveTextContent('No monte 2')
  expect(stats).toHaveTextContent('Erros 1')
  // atalhos: V vira, seta direita acerta
  for (let i = 0; i < 2; i++) {
    await userEvent.keyboard('v')
    await userEvent.keyboard('{ArrowRight}')
  }
  expect(screen.getByRole('heading', { name: 'Monte terminado' })).toBeInTheDocument()
  expect(screen.getByText('2 cartões: 1 à primeira, 1 com pelo menos um erro, 1 erro no total.')).toBeInTheDocument()
  expect(within(screen.getByRole('list', { name: 'Cartões errados' })).getAllByRole('listitem')).toHaveLength(1)
  await userEvent.click(screen.getByRole('button', { name: 'Praticar só as que errei' }))
  expect(screen.getByTestId('fc-stats')).toHaveTextContent('No monte 1')
})

test('continua o monte guardado no aparelho e grava a cada resposta; monte terminado apaga', async () => {
  localStorage.setItem(pileKey(DECK.key), JSON.stringify({
    pile: ['lektion-1:1:d', 'lektion-2:0:d'], total: 3, errs: { 'lektion-1:1:d': 1 }, wrong: 1, removed: 1,
    last: ['lektion-1:0:d', 'lektion-1:1:d', 'lektion-2:0:d'], lists: ['lektion-1', 'lektion-2'], dir: 'de-pt',
  }))
  page()
  // a seleção atual (Lektion 1, os dois) não é a do monte guardado: "Começar" é o principal
  expect(screen.getByRole('button', { name: /Continuar onde parei/ })).toHaveAttribute('data-variant', 'outline')
  await userEvent.click(screen.getByRole('button', { name: /Alemão → português/ }))
  await userEvent.click(screen.getByRole('button', { name: 'Todas' }))
  expect(screen.getByRole('button', { name: /Continuar onde parei/ })).toHaveAttribute('data-variant', 'default')
  await userEvent.click(screen.getByRole('button', { name: 'Continuar onde parei: Lektion 1, Lektion 2 · DE → PT (2 cartões no monte)' }))
  const stats = screen.getByTestId('fc-stats')
  expect(stats).toHaveTextContent('No monte 2')
  expect(stats).toHaveTextContent('Erros 1')
  expect(screen.getByTestId('fc-card')).toHaveTextContent('die Frage')
  await userEvent.keyboard('v')
  await userEvent.keyboard('{ArrowRight}')
  expect(stored()?.pile).toEqual(['lektion-2:0:d'])
  // voltar ao menu mantém o monte para continuar
  await userEvent.click(screen.getByRole('button', { name: /Menu/ }))
  await userEvent.click(screen.getByRole('button', { name: 'Continuar onde parei: Lektion 1, Lektion 2 · DE → PT (1 cartão no monte)' }))
  await userEvent.keyboard('v')
  await userEvent.keyboard('{ArrowRight}')
  expect(screen.getByRole('heading', { name: 'Monte terminado' })).toBeInTheDocument()
  expect(stored()).toBeNull()
})

test('"Continuar" usa a direção dos cartões do monte e repõe a seleção', async () => {
  // monte só PT → DE, gravado com o dir errado (como acontecia antes)
  localStorage.setItem(pileKey(DECK.key), JSON.stringify({
    pile: ['lektion-1:0:p'], total: 2, errs: {}, wrong: 0, removed: 1,
    last: ['lektion-1:0:p', 'lektion-1:1:p'], lists: ['lektion-1'], dir: 'de-pt',
  }))
  page()
  await userEvent.click(screen.getByRole('button', { name: 'Continuar onde parei: Lektion 1 · PT → DE (1 cartão no monte)' }))
  expect(screen.getByTestId('fc-card')).toHaveTextContent('PT → DE')
  expect((JSON.parse(localStorage.getItem(pileKey(DECK.key))!) as { dir: string }).dir).toBe('pt-de')
  await userEvent.click(screen.getByRole('button', { name: /Menu/ }))
  expect(screen.getByRole('button', { name: /Português → alemão/ })).toHaveAttribute('aria-pressed', 'true')
})

test('sem monte guardado (ou com um que já não serve), não aparece "Continuar"', () => {
  localStorage.setItem(pileKey(DECK.key), JSON.stringify({ pile: ['lektion-9:0:d'], last: [] }))
  page()
  expect(screen.getByRole('button', { name: /Começar com/ })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Continuar onde parei/ })).not.toBeInTheDocument()
})

test('com dois livros: escolher o livro, cada um com as suas listas, e o livro lembrado', async () => {
  const A2: FlashDeck = { ...DECK, key: 'de-daf-a2', title: 'Kurs DaF A2', lists: [
    { key: 'lektion-11', title: 'Lektion 11', cards: [card('der Grund, ⸚e', 'a razão', '11A')] },
  ] }
  const { unmount } = render(<FlashcardsPage decks={[DECK, A2]} />)
  expect(screen.queryByRole('button', { name: /^Lektion 11/ })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Kurs DaF A1\s*Lektion 1 a 2/ })).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(screen.getByRole('button', { name: /Kurs DaF A2/ }))
  expect(screen.getByRole('button', { name: /^Lektion 11/ })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Começar com 2 cartões' })).toBeInTheDocument()
  unmount()
  render(<FlashcardsPage decks={[DECK, A2]} />) // de volta: o A2
  expect(screen.getByRole('button', { name: /Kurs DaF A2/ })).toHaveAttribute('aria-pressed', 'true')
})

test('com um só livro, não aparece a escolha de livro', () => {
  page()
  expect(screen.queryByRole('group', { name: 'Livro' })).not.toBeInTheDocument()
})

test('frase de exemplo: só no verso, nas duas direções', async () => {
  const ex = { ...card('kommen', 'vir'), ex: 'Ich komme aus Brasilien.', ex_pt: 'Venho do Brasil.' }
  render(<FlashcardsPage decks={[{ ...DECK, lists: [{ key: 'lektion-1', title: 'Lektion 1', cards: [ex] }] }]} />)
  await userEvent.click(screen.getByRole('button', { name: 'Começar com 2 cartões' }))
  for (let i = 0; i < 2; i++) {
    expect(screen.queryByTestId('fc-example')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Virar' }))
    expect(screen.getByTestId('fc-example')).toHaveTextContent('Ich komme aus Brasilien.Venho do Brasil.')
    await userEvent.click(screen.getByRole('button', { name: /Certo/ }))
  }
})

test('cartão anterior: desfaz a última resposta (botão, Backspace e deslizar para a direita)', async () => {
  page()
  await userEvent.click(screen.getByRole('button', { name: /Alemão → português/ })) // 2 cartões
  await userEvent.click(screen.getByRole('button', { name: 'Começar com 2 cartões' }))
  const stats = screen.getByTestId('fc-stats')
  const front = () => within(screen.getByTestId('fc-card')).getByText(/^(der Kurs|die Frage)/).textContent
  expect(screen.getByRole('button', { name: /Cartão anterior/ })).toBeDisabled()
  const first = front()
  await userEvent.click(screen.getByRole('button', { name: 'Virar' }))
  await userEvent.click(screen.getByRole('button', { name: /Errado/ }))
  expect(stats).toHaveTextContent('Erros 1')
  // botão: o mesmo cartão, por virar, e o erro desfeito
  await userEvent.click(screen.getByRole('button', { name: /Cartão anterior/ }))
  expect(front()).toBe(first)
  expect(screen.queryByTestId('fc-answer')).not.toBeInTheDocument()
  expect(stats).toHaveTextContent('Erros 0')
  expect(screen.getByRole('button', { name: /Cartão anterior/ })).toBeDisabled()
  // Backspace
  await userEvent.keyboard('v')
  await userEvent.keyboard('{ArrowRight}')
  expect(stats).toHaveTextContent('Certas 1')
  await userEvent.keyboard('{Backspace}')
  expect(stats).toHaveTextContent('Certas 0')
  expect(front()).toBe(first)
  // deslizar para a direita (um toque vertical não conta)
  await userEvent.keyboard('v')
  await userEvent.keyboard('{ArrowRight}')
  const cardEl = screen.getByTestId('fc-card')
  fireEvent.touchStart(cardEl, { touches: [{ clientX: 100, clientY: 100 }] })
  fireEvent.touchEnd(cardEl, { changedTouches: [{ clientX: 110, clientY: 300 }] })
  expect(stats).toHaveTextContent('Certas 1')
  fireEvent.touchStart(cardEl, { touches: [{ clientX: 50, clientY: 100 }] })
  fireEvent.touchEnd(cardEl, { changedTouches: [{ clientX: 200, clientY: 110 }] })
  expect(stats).toHaveTextContent('Certas 0')
  // do fim do monte também se volta ao último cartão
  for (let i = 0; i < 2; i++) {
    await userEvent.keyboard('v')
    await userEvent.keyboard('{ArrowRight}')
  }
  expect(screen.getByRole('heading', { name: 'Monte terminado' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /Cartão anterior/ }))
  expect(screen.getByTestId('fc-stats')).toHaveTextContent('No monte 1')
})

test('saltar: o cartão fica no monte, sem contar (botão, S e deslizar para a esquerda); o anterior desfaz', async () => {
  page()
  await userEvent.click(screen.getByRole('button', { name: /Alemão → português/ })) // 2 cartões
  await userEvent.click(screen.getByRole('button', { name: 'Começar com 2 cartões' }))
  const stats = screen.getByTestId('fc-stats')
  const front = () => within(screen.getByTestId('fc-card')).getByText(/^(der Kurs|die Frage)/).textContent
  const first = front()
  await userEvent.click(screen.getByRole('button', { name: /Saltar/ })) // sem virar
  expect(front()).not.toBe(first)
  expect(stats).toHaveTextContent('No monte 2')
  expect(stats).toHaveTextContent('Certas 0')
  expect(stats).toHaveTextContent('Erros 0')
  await userEvent.keyboard('s')
  expect(front()).toBe(first)
  const cardEl = screen.getByTestId('fc-card')
  fireEvent.touchStart(cardEl, { touches: [{ clientX: 200, clientY: 100 }] })
  fireEvent.touchEnd(cardEl, { changedTouches: [{ clientX: 50, clientY: 110 }] })
  expect(front()).not.toBe(first)
  await userEvent.click(screen.getByRole('button', { name: /Cartão anterior/ }))
  expect(front()).toBe(first)
  // com um só cartão no monte, não há para onde saltar
  await userEvent.keyboard('v')
  await userEvent.keyboard('{ArrowRight}')
  expect(screen.getByRole('button', { name: /Saltar/ })).toBeDisabled()
})
