import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Navbar } from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'CookFlow - Interactive Recipe App',
  description: 'Follow recipes step-by-step with timers, submit your own recipes, and discover new favorites.',
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
      <body className={inter.className}>
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
