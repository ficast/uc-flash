import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FlashcardsPage } from '@/FlashcardsPage'
import { Footer } from '@/Footer'
import { InstallHelp } from '@/InstallHelp'
import { ThemeToggle } from '@/ThemeToggle'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="min-h-dvh px-4 py-6 sm:py-10">
      <div className="mx-auto -mt-2 mb-2 flex max-w-xl justify-end sm:-mt-6">
        <ThemeToggle />
      </div>
      <FlashcardsPage />
      <InstallHelp />
      <Footer />
    </main>
  </StrictMode>,
)
