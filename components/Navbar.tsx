'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { User, LogOut, Heart, Plus, Newspaper } from 'lucide-react'

export function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">CookFlow</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <Newspaper size={18} />
              <span>Recipes</span>
            </Link>
            {user && (
              <>
                <Link href="/submit" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                  <Plus size={18} />
                  <span>Submit Recipe</span>
                </Link>
                <Link href="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
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
                <Link href="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <User size={20} />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <span className="h-6 w-px bg-gray-300 mx-2" />
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100"
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
        <div className="md:hidden border-t border-gray-200 bg-gray-50">
          <div className="px-4 py-3 space-y-2">
            <Link href="/submit" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
              <Plus size={18} />
              <span>Submit Recipe</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
              <Heart size={18} />
              <span>Favorites</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
