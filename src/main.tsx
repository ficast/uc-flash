import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FlashcardsPage } from '@/FlashcardsPage'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="min-h-dvh px-4 py-6 sm:py-10">
      <FlashcardsPage />
    </main>
  </StrictMode>,
)
