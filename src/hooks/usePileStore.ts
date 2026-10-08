import { useCallback, useState } from 'react'
import type { CardKey, DirChoice, PileState } from '@/lib/flashcardDeck'

/** O monte guardado: o estado do monte, os cartões da seleção (para "recomeçar"), listas e direção. */
export type SavedPile = PileState & { last: CardKey[]; lists: string[]; dir: DirChoice }

export const pileKey = (deck: string) => `flashcards-pile-${deck}`

function read(deck: string): SavedPile | null {
  try {
    return JSON.parse(localStorage.getItem(pileKey(deck)) ?? 'null') as SavedPile | null
  } catch {
    return null
  }
}

/**
 * O monte em andamento, guardado neste aparelho (localStorage) para continuar onde parou: lido ao abrir a página e
 * gravado a cada resposta. Monte terminado apaga o andamento.
 */
export function usePileStore(deck: string) {
  const [saved, setSaved] = useState<SavedPile | null>(() => read(deck))

  /** Guarda o monte (ou nada, quando ele acabou). */
  const save = useCallback((state: SavedPile | null) => {
    const next = state && state.pile.length ? state : null
    setSaved(next)
    try {
      if (next) localStorage.setItem(pileKey(deck), JSON.stringify(next))
      else localStorage.removeItem(pileKey(deck))
    } catch { /* sem armazenamento: o monte vale só nesta visita */ }
  }, [deck])

  return { saved, save }
}
