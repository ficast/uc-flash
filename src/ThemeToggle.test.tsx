import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

afterEach(() => document.documentElement.classList.remove('dark'))

test('alterna claro/escuro e guarda a escolha', async () => {
  render(<ThemeToggle />)
  await userEvent.click(screen.getByRole('button', { name: 'Mudar para o modo escuro' }))
  expect(document.documentElement).toHaveClass('dark')
  expect(localStorage.getItem('theme')).toBe('dark')
  await userEvent.click(await screen.findByRole('button', { name: 'Mudar para o modo claro' }))
  expect(document.documentElement).not.toHaveClass('dark')
  expect(localStorage.getItem('theme')).toBe('light')
})
