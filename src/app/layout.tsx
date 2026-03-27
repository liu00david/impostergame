import type { Metadata } from 'next'
import './globals.css'
import { GameProvider } from '@/context/GameContext'
import { ThemeProvider } from '@/context/ThemeContext'

export const metadata: Metadata = {
  title: 'Spyhunt',
  description: 'A covert word deduction party game',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Spyhunt',
    description: 'A covert word deduction party game',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spyhunt',
    description: 'A covert word deduction party game',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var stored = localStorage.getItem('theme');
            var theme = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
            if (theme === 'light') document.documentElement.classList.add('light');
          })();
        `}} />
      </head>
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
