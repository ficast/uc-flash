import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

test('rodapé: Ko-fi, copyright, licença e ligação ao código', () => {
  render(<Footer />)
  expect(screen.getByText(/© 2026 Filipe de Castro/)).toHaveTextContent('Livre para uso e estudo (licença MIT)')
  expect(screen.getByRole('link', { name: 'Código no GitHub' })).toHaveAttribute('href', 'https://github.com/ficast/uc-flash')
  expect(screen.getByRole('link', { name: 'paga-me um café ☕' })).toHaveAttribute('href', 'https://ko-fi.com/ficast')
})
