import { render, screen } from '@testing-library/react'
import { InstallHelp } from './InstallHelp'

const displayMode = (standalone: boolean) => {
  window.matchMedia = ((q: string) => ({ matches: standalone && q.includes('standalone') })) as typeof window.matchMedia
}

test('no navegador: mostra como instalar no iPhone e no Android', () => {
  displayMode(false)
  render(<InstallHelp />)
  expect(screen.getByText('Instalar no telemóvel')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'iPhone (Safari)' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Android (Chrome)' })).toBeInTheDocument()
})

test('já instalada: não mostra nada', () => {
  displayMode(true)
  const { container } = render(<InstallHelp />)
  expect(container).toBeEmptyDOMElement()
})
