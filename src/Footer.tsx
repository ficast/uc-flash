import { FOOTER } from '@/lib/strings'

/** Ko-fi, copyright e licença, no fim da página. */
export function Footer() {
  return (
    <footer className="mx-auto mt-8 max-w-xl text-center text-xs text-muted-foreground">
      <p className="mb-1">
        {FOOTER.coffeeIntro}{' '}
        <a href={FOOTER.kofi} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
          {FOOTER.coffee}
        </a>
      </p>
      {FOOTER.copyright} · {FOOTER.license} ·{' '}
      <a href={FOOTER.repo} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
        {FOOTER.source}
      </a>
    </footer>
  )
}
