export interface FlashCard {
  de: string
  ipa: string
  pt: string
  plural: string
  nota: string
  /** Secção da lição no livro (1A, 2C…). */
  sec: string
  /** Frase de exemplo em alemão e a tradução; só no verso. */
  ex?: string
  ex_pt?: string
}

export interface FlashDeck {
  key: string
  title: string
  language: string
  support_language: string
  lists: { key: string; title: string; cards: FlashCard[] }[]
}
