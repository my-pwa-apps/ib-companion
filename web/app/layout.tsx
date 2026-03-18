import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: { default: 'IB Companion', template: '%s | IB Companion' },
  description: 'AI-powered study platform for International Baccalaureate students.',
  keywords: ['IB', 'International Baccalaureate', 'TOK', 'Extended Essay', 'IA', 'study', 'AI tutor'],
  icons: { icon: '/icon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'text-sm font-medium',
            duration: 4000,
            style: { borderRadius: '10px', border: '1px solid #e4e8f0' },
          }}
        />
      </body>
    </html>
  )
}
