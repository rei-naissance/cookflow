import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Navbar } from '@/components/Navbar'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})



export const metadata: Metadata = {
  title: 'CookFlow | The Ultimate Interactive Recipe Experience',
  description: 'Master the art of cooking with CookFlow. Follow interactive step-by-step recipes with built-in timers, voice instructions, and a vibrant community of food enthusiasts.',
  keywords: ['recipes', 'cooking', 'chef', 'interactive recipes', 'meal prep', 'food community'],
  authors: [{ name: 'CookFlow Team' }],
  openGraph: {
    title: 'CookFlow | The Ultimate Interactive Recipe Experience',
    description: 'Master the art of cooking with CookFlow. Follow interactive step-by-step recipes with built-in timers.',
    type: 'website',
  },
}

import { PagePreloader } from '@/components/PagePreloader'

import { NavbarWrapper } from '@/components/NavbarWrapper'

// ... (other imports)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <PagePreloader />
          <div className="min-h-screen bg-gray-50">
            <NavbarWrapper />
            <main>
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
