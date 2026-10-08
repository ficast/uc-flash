import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FlashcardsPage } from './FlashcardsPage'
import { pileKey } from '@/hooks/usePileStore'
import { DECKS } from '@/lib/decks'
import type { FlashDeck } from '@/lib/types'

const card = (de: string, pt: string, sec = '1A') => ({ de, ipa: 'ipa', pt, plural: '', nota: '', sec })
const DECK: FlashDeck = { key: 'de-daf-a1', title: 'Deutsch A1 (DaF)', language: 'de', support_language: 'pt', lists: [
  { key: 'lektion-1', title: 'Lektion 1', cards: [card('der Kurs, -e', 'o curso'), card('die Frage, -n', 'a pergunta')] },
  { key: 'lektion-2', title: 'Lektion 2', cards: [card('das Buch, ⸚er', 'o livro', '2A')] },
] }
const page = () => render(<FlashcardsPage decks={[DECK]} />)
const stored = () => JSON.parse(localStorage.getItem(pileKey(DECK.key)) ?? 'null') as { pile: string[] } | null

test('o baralho incluído: Lektion 1 a 10, 1.481 vocábulos', () => {
  const [deck] = DECKS
  expect(deck.lists.map((l) => l.title)).toEqual(Array.from({ length: 10 }, (_, i) => `Lektion ${i + 1}`))
  expect(deck.lists.reduce((n, l) => n + l.cards.length, 0)).toBe(1481)
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
