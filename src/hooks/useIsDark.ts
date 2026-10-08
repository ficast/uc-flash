import { useEffect, useState } from 'react'

/** Tema efetivo (a classe `dark` no <html>, aplicada pelo ThemeProvider). */
export function useIsDark(): boolean {
  const read = () => document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(read)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(read()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}
