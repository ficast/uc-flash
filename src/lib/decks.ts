import deDafA1 from '@/data/de-daf-a1.json'
import deDafA2 from '@/data/de-daf-a2.json'
import deDafB1 from '@/data/de-daf-b1.json'
import type { FlashDeck } from './types'

/** Os baralhos vêm no próprio bundle: alemão A1, A2 e B1. */
export const DECKS: FlashDeck[] = [deDafA1, deDafA2, deDafB1]
