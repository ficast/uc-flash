import { Smartphone } from 'lucide-react'
import { INSTALL } from '@/lib/strings'

/** Já está a correr como app instalada (ecrã inteiro), e então não precisa das instruções. */
const installed = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true

/** Rodapé com as instruções para instalar a PWA no iPhone e no Android. */
export function InstallHelp() {
  if (installed()) return null
  return (
    <aside className="mx-auto mt-10 max-w-xl border-t pt-4 text-sm text-muted-foreground">
      <details>
        <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-foreground">
          <Smartphone className="size-4" /> {INSTALL.title}
        </summary>
        <p className="mt-3">{INSTALL.intro}</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {[INSTALL.ios, INSTALL.android].map((os) => (
            <section key={os.name}>
              <h2 className="font-medium text-foreground">{os.name}</h2>
              <ol className="mt-1 list-decimal space-y-1 pl-5">
                {os.steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
            </section>
          ))}
        </div>
      </details>
    </aside>
  )
}
