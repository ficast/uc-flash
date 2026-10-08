import { Check, Play, RotateCcw, Undo2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useIsDark } from '@/hooks/useIsDark'
import { type SavedPile, usePileStore } from '@/hooks/usePileStore'
import { DECKS } from '@/lib/decks'
import {
  answer, cardOf, type CardKey, type DirChoice, dirsFor, genderParts, type PileState, selection, startPile, summary,
} from '@/lib/flashcardDeck'
import { T } from '@/lib/strings'
import type { FlashDeck } from '@/lib/types'
import { cn } from '@/lib/utils'

// Cores do artigo (der/die/das), como no baralho original, com o tom de cada modo.
const GENDER = {
  light: { m: '#1d4ed8', f: '#b91c1c', n: '#15803d', ipa: '#6b4aa3' },
  dark: { m: '#7aa7ff', f: '#ff8a8a', n: '#6ee09a', ipa: '#b79af0' },
}

/** Flashcards: escolher listas e direção, praticar o monte (os erros voltam) e ver o resumo. */
export function FlashcardsPage({ decks = DECKS }: { decks?: FlashDeck[] }) {
  const deck = decks[0]
  if (!deck) return <p className="text-sm text-muted-foreground">{T.empty}</p>
  return <Practice deck={deck} />
}

/** Listas e direção escolhidas por último neste aparelho (sem elas, a primeira lista). */
const cfgKey = (deck: string) => `flashcards-cfg-${deck}`
function loadCfg(deck: FlashDeck): { lists: string[]; dir: DirChoice } {
  try {
    const c = JSON.parse(localStorage.getItem(cfgKey(deck.key)) ?? 'null') as { lists?: string[]; dir?: DirChoice } | null
    const known = new Set(deck.lists.map((l) => l.key))
    const lists = (c?.lists ?? []).filter((k) => known.has(k))
    return { lists: c ? lists : deck.lists.slice(0, 1).map((l) => l.key), dir: c?.dir ?? 'both' }
  } catch {
    return { lists: deck.lists.slice(0, 1).map((l) => l.key), dir: 'both' }
  }
}
function saveCfg(deck: string, lists: string[], dir: DirChoice) {
  try { localStorage.setItem(cfgKey(deck), JSON.stringify({ lists, dir })) } catch { /* sem armazenamento */ }
}

/** O monte guardado ainda serve para este baralho (o baralho pode ter mudado desde então). */
function validPile(deck: FlashDeck, p: SavedPile): boolean {
  const ok = (k: CardKey) => {
    const [list, i, d] = k.split(':')
    const l = deck.lists.find((x) => x.key === list)
    return !!l && Number(i) >= 0 && Number(i) < l.cards.length && (d === 'd' || d === 'p')
  }
  return Array.isArray(p.pile) && Array.isArray(p.last) && p.pile.length > 0 && p.pile.every(ok) && p.last.every(ok)
}

/** "Lektion 3 · PT → DE": as listas e a direção de um monte guardado. */
function pileLabel(deck: FlashDeck, p: SavedPile): string {
  const titles = deck.lists.filter((l) => p.lists.includes(l.key)).map((l) => l.title)
  const lists = titles.length > 3 ? `${titles.length} listas` : titles.join(', ')
  return `${lists} · ${T.dirTag[p.dir] ?? ''}`
}

function Practice({ deck }: { deck: FlashDeck }) {
  const [lists, setListsRaw] = useState<string[]>(() => loadCfg(deck).lists)
  const [dir, setDirRaw] = useState<DirChoice>(() => loadCfg(deck).dir)
  const setLists = (v: string[]) => { setListsRaw(v); saveCfg(deck.key, v, dir) }
  const setDir = (v: DirChoice) => { setDirRaw(v); saveCfg(deck.key, lists, v) }
  const [state, setState] = useState<PileState | null>(null)
  const [last, setLast] = useState<CardKey[]>([])
  const [flipped, setFlipped] = useState(false)
  const ids = useMemo(() => selection(deck, lists, dir), [deck, lists, dir])
  const practiced = useMemo(() => [...new Set(last.map((k) => k.split(':')[0]))], [last])
  // O monte em andamento fica neste aparelho: continua onde parou.
  const store = usePileStore(deck.key)
  const { save } = store
  useEffect(() => {
    if (state) save({ ...state, last, lists: practiced, dir })
  }, [state, last, practiced, dir, save])
  const resumable = useMemo(() => (store.saved && validPile(deck, store.saved) ? store.saved : null), [deck, store.saved])
  // "Continuar" só é o botão principal quando a seleção atual é a do monte guardado; senão, é "Começar".
  const resumeFirst = !!resumable && resumable.dir === dir
    && resumable.lists.length === lists.length && resumable.lists.every((k) => lists.includes(k))
  const resume = (p: SavedPile) => {
    setLast(p.last)
    setState({ pile: p.pile, total: p.total, errs: p.errs, wrong: p.wrong, removed: p.removed })
    setFlipped(false)
  }

  const begin = (keys: CardKey[]) => {
    setLast(keys)
    setState(startPile(keys))
    setFlipped(false)
  }
  const respond = useCallback((ok: boolean) => {
    if (!flipped) return
    setState((s) => (s ? answer(s, ok) : s))
    setFlipped(false)
  }, [flipped])

  useEffect(() => {
    if (!state || state.pile.length === 0) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'v' || e.key === 'V') { e.preventDefault(); setFlipped(true) }
      else if (e.key === 'ArrowRight') { e.preventDefault(); respond(true) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); respond(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state, respond])

  const header = (
    <header className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm text-muted-foreground">{deck.title}</p>
        <h1 className="text-2xl font-semibold">{T.title}</h1>
      </div>
      {state && <Button variant="outline" size="sm" onClick={() => setState(null)}><Undo2 /> {T.menu}</Button>}
    </header>
  )

  // Escolha
  if (!state) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        {header}
        <Group label={T.lists} hint={T.listsHint}>
          {deck.lists.map((l) => (
            <Chip key={l.key} pressed={lists.includes(l.key)}
              onClick={() => setLists(lists.includes(l.key) ? lists.filter((x) => x !== l.key)
                : deck.lists.map((x) => x.key).filter((k) => k === l.key || lists.includes(k)))}
              sub={T.cards(l.cards.length * dirsFor(dir).length)}>
              {l.title}
            </Chip>
          ))}
        </Group>
        <div className="-mt-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setLists(deck.lists.map((l) => l.key))}>{T.all}</Button>
          <Button variant="ghost" size="sm" onClick={() => setLists([])}>{T.none}</Button>
        </div>
        <Group label={T.direction}>
          {(['both', 'de-pt', 'pt-de'] as DirChoice[]).map((d) => (
            <Chip key={d} pressed={dir === d} onClick={() => setDir(d)} sub={T.dirHint[d]}>{T.dir[d]}</Chip>
          ))}
        </Group>
        <Legend />
        {resumable && (
          <Button className="h-auto min-h-12 w-full whitespace-normal py-2" variant={resumeFirst ? 'default' : 'outline'}
            onClick={() => resume(resumable)}>
            <Play /> {T.resume(resumable.pile.length, pileLabel(deck, resumable))}
          </Button>
        )}
        <Button className="h-12 w-full" variant={resumeFirst ? 'outline' : 'default'} disabled={ids.length === 0} onClick={() => begin(ids)}>
          {ids.length ? T.start(ids.length) : T.pickList}
        </Button>
        <p className="text-center text-xs text-muted-foreground">{T.localNote}</p>
      </div>
    )
  }

  // Fim
  if (state.pile.length === 0) {
    const s = summary(state)
    return (
      <div className="mx-auto max-w-xl space-y-5">
        {header}
        <section aria-labelledby="fc-done" className="space-y-4">
          <h2 id="fc-done" className="text-xl font-semibold">{T.done}</h2>
          <p className="text-sm text-muted-foreground">
            {T.summary({ total: s.total, first: s.firstTry, missed: s.missed.length, wrong: s.wrong })}
          </p>
          {s.missed.length > 0 && (
            <ul className="divide-y rounded-xl border bg-card text-sm" aria-label={T.missedList}>
              {s.missed.map(({ key, times }) => {
                const { card, dir: d } = cardOf(deck, key)
                return (
                  <li key={key} className="flex justify-between gap-3 px-4 py-2">
                    <span className="font-medium"><German text={card.de} /></span>
                    <span className="text-right text-muted-foreground">
                      {card.pt} ({T.missedTimes(times)}, {T.dirShort[d]})
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          <Button className="h-12 w-full" onClick={() => begin(last)}><RotateCcw /> {T.again}</Button>
          {s.missed.length > 0 && (
            <Button variant="outline" className="h-12 w-full" onClick={() => begin(s.missed.map((m) => m.key))}>
              {T.onlyMissed}
            </Button>
          )}
        </section>
      </div>
    )
  }

  // Prática
  const { card, dir: d } = cardOf(deck, state.pile[0])
  const left = state.pile.length
  const progress = state.total ? (state.removed / state.total) * 100 : 0
  return (
    <div className="mx-auto max-w-xl space-y-5">
      {header}
      <div className="flex justify-between text-sm text-muted-foreground" data-testid="fc-stats">
        <span>{T.left} <b className="text-foreground tabular-nums">{left}</b></span>
        <span>{T.right} <b className="text-foreground tabular-nums">{state.removed}</b></span>
        <span>{T.wrong} <b className="text-foreground tabular-nums">{state.wrong}</b></span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground transition-[width]" style={{ width: `${progress}%` }} />
      </div>
      <article className="relative flex min-h-72 flex-col items-center justify-center gap-2 rounded-2xl border bg-card px-5 py-8 text-center"
        data-testid="fc-card" aria-live="polite">
        <span className="absolute top-3 left-4 text-xs text-muted-foreground">{card.sec}</span>
        <span className="absolute top-3 right-4 text-xs text-muted-foreground">{T.dirShort[d]}</span>
        {d === 'd' ? <GermanSide card={card} /> : <p className="text-3xl font-medium">{card.pt}</p>}
        {flipped && (
          <div className="mt-4 flex w-full flex-col items-center gap-1.5 border-t pt-4" data-testid="fc-answer">
            {d === 'd' ? <p className="text-3xl font-medium">{card.pt}</p> : <GermanSide card={card} />}
            {card.plural && <p className="text-sm text-muted-foreground">{T.plural}: {card.plural}</p>}
            {card.nota && <p className="max-w-[40ch] text-sm text-muted-foreground italic">{card.nota}</p>}
          </div>
        )}
      </article>
      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" className="h-14" onClick={() => setFlipped(true)} disabled={flipped}>{T.flip}</Button>
        <Button className="h-14" onClick={() => respond(true)} disabled={!flipped}><Check /> {T.ok}</Button>
        <Button variant="outline" className="h-14" onClick={() => respond(false)} disabled={!flipped}><X /> {T.bad}</Button>
      </div>
      <p className="hidden text-center text-xs text-muted-foreground sm:block">{T.keys}</p>
    </div>
  )
}

function GermanSide({ card }: { card: FlashDeck['lists'][number]['cards'][number] }) {
  const dark = useIsDark()
  return (
    <>
      <p className="text-3xl font-semibold break-words" lang="de"><German text={card.de} /></p>
      {card.ipa && <p className="text-base" style={{ color: GENDER[dark ? 'dark' : 'light'].ipa }}>[{card.ipa}]</p>}
    </>
  )
}

/** A forma alemã com o artigo de cada parte na cor do género. */
function German({ text }: { text: string }) {
  const dark = useIsDark()
  const c = GENDER[dark ? 'dark' : 'light']
  return (
    <>
      {genderParts(text).map((p, i) => (
        <span key={i}>
          {i > 0 && <span className="text-muted-foreground font-normal"> / </span>}
          <span data-gender={p.gender ?? undefined} style={p.gender ? { color: c[p.gender] } : undefined}>{p.text}</span>
        </span>
      ))}
    </>
  )
}

function Legend() {
  const dark = useIsDark()
  const c = GENDER[dark ? 'dark' : 'light']
  return (
    <Group label={T.colors}>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-base font-semibold">
        <span style={{ color: c.m }}>der <small className="font-normal text-muted-foreground">{T.gender.m}</small></span>
        <span style={{ color: c.f }}>die <small className="font-normal text-muted-foreground">{T.gender.f}</small></span>
        <span style={{ color: c.n }}>das <small className="font-normal text-muted-foreground">{T.gender.n}</small></span>
        <span>{T.gender.x}</span>
      </p>
    </Group>
  )
}

function Group({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>{children}</div>
    </div>
  )
}

function Chip({ pressed, onClick, sub, children }: {
  pressed: boolean
  onClick: () => void
  sub?: string
  children: React.ReactNode
}) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick}
      className={cn('min-w-28 flex-1 rounded-xl border bg-card px-3 py-2.5 text-left text-sm font-medium',
        pressed && 'border-foreground ring-1 ring-foreground')}>
      {children}
      {sub && <span className="block text-xs font-normal text-muted-foreground">{sub}</span>}
    </button>
  )
}
