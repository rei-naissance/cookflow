'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { User, LogOut, Heart, Plus, Newspaper } from 'lucide-react'

export function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="bg-background sticky top-0 z-50 border-b border-border/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">CookFlow</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <Newspaper size={18} />
              <span>Recipes</span>
            </Link>
            {user && (
              <>
                <Link href="/submit" className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  <Plus size={18} />
                  <span>Submit Recipe</span>
                </Link>
                <Link href="/favorites" className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  <Heart size={18} />
                  <span>Favorites</span>
                </Link>
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-6">
                <Link href="/profile" className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  <User size={20} />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <span className="h-4 w-px bg-border mx-2" />
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors px-3 py-2 rounded-lg hover:bg-secondary"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-primary"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {user && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-3 space-y-2">
            <Link href="/submit" className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <Plus size={18} />
              <span>Submit Recipe</span>
            </Link>
            <Link href="/favorites" className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <Heart size={18} />
              <span>Favorites</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
