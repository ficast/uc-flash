import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIsDark } from '@/hooks/useIsDark'
import { THEME } from '@/lib/strings'

/** Alterna entre claro e escuro; a escolha fica neste aparelho (sem ela, vale o tema do sistema). */
export function ThemeToggle() {
  const dark = useIsDark()
  const toggle = () => {
    const next = dark ? 'light' : 'dark'
    try { localStorage.setItem('theme', next) } catch { /* sem armazenamento: vale só nesta visita */ }
    document.documentElement.classList.toggle('dark', next === 'dark')
  }
  const label = dark ? THEME.toLight : THEME.toDark
  return (
    <Button variant="ghost" size="sm" className="size-8 px-0" onClick={toggle} aria-label={label} title={label}>
      {dark ? <Sun /> : <Moon />}
    </Button>
  )
}
