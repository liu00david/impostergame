import type { Metadata } from 'next'
import './globals.css'
import { GameProvider } from '@/context/GameContext'
import { ThemeProvider } from '@/context/ThemeContext'

export const metadata: Metadata = {
  title: 'Spyhunt',
  description: 'A covert word deduction party game',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
        <ThemeProvider>
          <GameProvider>
            {children}
          </GameProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
