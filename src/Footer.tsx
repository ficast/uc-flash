import { FOOTER } from '@/lib/strings'

/** Copyright e licença, no fim da página. */
export function Footer() {
  return (
    <footer className="mx-auto mt-8 max-w-xl text-center text-xs text-muted-foreground">
      {FOOTER.copyright} · {FOOTER.license} ·{' '}
      <a href={FOOTER.repo} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
        {FOOTER.source}
      </a>
    </footer>
  )
}
