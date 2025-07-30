'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter } from 'lucide-react'

const categories = [
  'All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Appetizer', 'Vegan', 'Vegetarian'
]

const difficulties = ['All', 'Easy', 'Medium', 'Hard']

const timeOptions = [
  { label: 'Any time', value: '' },
  { label: 'Under 15 min', value: '15' },
  { label: 'Under 30 min', value: '30' },
  { label: 'Under 1 hour', value: '60' },
]

export function SearchAndFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const currentSearch = searchParams.get('search') || ''
  const currentCategory = searchParams.get('category') || 'All'
  const currentDifficulty = searchParams.get('difficulty') || 'All'
  const currentTime = searchParams.get('time') || ''

  const [searchTerm, setSearchTerm] = useState(currentSearch)

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== 'All' && value !== '') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/?${params.toString()}`)
  }

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchTerm !== currentSearch) {
        updateSearchParams('search', searchTerm)
      }
    }, 500) // 500ms delay

    return () => clearTimeout(timeout)
  }, [searchTerm])

  return (
    <div className="mb-8">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" size={20} />
          <input
            type="text"
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recipes..."
            className="w-full pl-10 pr-4 py-3 text-gray-900 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="text-center mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors"
        >
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={currentCategory}
                onChange={(e) => updateSearchParams('category', e.target.value)}
                className="w-full input-field"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={currentDifficulty}
                onChange={(e) => updateSearchParams('difficulty', e.target.value)}
                className="w-full input-field"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Time
              </label>
              <select
                value={currentTime}
                onChange={(e) => updateSearchParams('time', e.target.value)}
                className="w-full input-field"
              >
                {timeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
