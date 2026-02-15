'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'

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

    router.replace(`/?${params.toString()}`, { scroll: false })
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
    <div className="mb-8 w-full max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for recipes..."
            className="w-full pl-12 pr-4 py-3 h-12 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground shadow-sm transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center justify-center h-12 px-5 rounded-xl transition-colors border ${showFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-muted'}`}
        >
          {showFilters ? <X size={20} /> : <Filter size={20} />}
          <span className="ml-2 hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Category
              </label>
              <select
                value={currentCategory}
                onChange={(e) => updateSearchParams('category', e.target.value)}
                className="w-full input-field bg-background text-foreground"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Difficulty
              </label>
              <select
                value={currentDifficulty}
                onChange={(e) => updateSearchParams('difficulty', e.target.value)}
                className="w-full input-field bg-background text-foreground"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Max Time
              </label>
              <select
                value={currentTime}
                onChange={(e) => updateSearchParams('time', e.target.value)}
                className="w-full input-field bg-background text-foreground"
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
