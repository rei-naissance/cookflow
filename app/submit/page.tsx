'use client'
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { createClientSupabaseClient } from '@/lib/supabaseClient'
import { Plus, Minus, Clock, Upload, X } from 'lucide-react'
import Image from 'next/image'

const categories = [
  'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Appetizer', 'Vegan', 'Vegetarian'
]

const difficulties = ['Easy', 'Medium', 'Hard']

interface Step {
  instruction: string
  timer_duration: number | null
}

interface Ingredient {
  text: string
}

export default function SubmitRecipePage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy')
  const [prepTime, setPrepTime] = useState(15)
  const [cookTime, setCookTime] = useState(30)
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ text: '' }])
  const [steps, setSteps] = useState<Step[]>([{ instruction: '', timer_duration: null }])
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if not authenticated (client-only)
  // and perform any localStorage logic (if needed)
  // This ensures router and localStorage are only accessed on the client
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
    // Example: localStorage usage (add your logic here if needed)
    // if (typeof window !== 'undefined') {
    //   localStorage.setItem('someKey', 'someValue')
    // }
  }, [user, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addIngredient = () => {
    setIngredients([...ingredients, { text: '' }])
  }

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index))
    }
  }

  const updateIngredient = (index: number, text: string) => {
    const updated = [...ingredients]
    updated[index].text = text
    setIngredients(updated)
  }

  const addStep = () => {
    setSteps([...steps, { instruction: '', timer_duration: null }])
  }

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index))
    }
  }

  const updateStep = (index: number, field: keyof Step, value: string | number | null) => {
    const updated = [...steps]
    updated[index] = { ...updated[index], [field]: value }
    setSteps(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate form
      if (!title.trim()) throw new Error('Title is required')
      if (ingredients.some(ing => !ing.text.trim())) throw new Error('All ingredients must be filled')
      if (steps.some(step => !step.instruction.trim())) throw new Error('All step instructions must be filled')

      let imageUrl = null

      // Upload image if provided
      if (image && user) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('recipe-images')
          .upload(fileName, image)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(fileName)

        imageUrl = publicUrl
      }

      // Create recipe
      let recipe = null
      let recipeError = null
      if (user) {
        const result = await supabase
          .from('recipes')
          .insert({
            title: title.trim(),
            author_id: user.id,
            category,
            difficulty,
            prep_time: prepTime,
            cook_time: cookTime,
            image_url: imageUrl
          })
          .select()
          .single()
        recipe = result.data
        recipeError = result.error
        if (recipeError) throw recipeError
      }

      // Create ingredients
      const ingredientInserts = ingredients
        .filter(ing => ing.text.trim())
        .map((ing, index) => ({
          recipe_id: recipe.id,
          text: ing.text.trim(),
          order_index: index
        }))

      const { error: ingredientsError } = await supabase
        .from('ingredients')
        .insert(ingredientInserts)

      if (ingredientsError) throw ingredientsError

      // Create steps
      const stepInserts = steps
        .filter(step => step.instruction.trim())
        .map((step, index) => ({
          recipe_id: recipe.id,
          step_number: index + 1,
          instruction: step.instruction.trim(),
          timer_duration: step.timer_duration
        }))

      const { error: stepsError } = await supabase
        .from('steps')
        .insert(stepInserts)

      if (stepsError) throw stepsError

      // Redirect to the new recipe
      router.push(`/recipe/${recipe.id}`)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit a Recipe</h1>
        <p className="text-gray-600">Share your favorite recipe with the CookFlow community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="e.g., Grandma's Chocolate Chip Cookies"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                className="input-field"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prep Time (minutes)
              </label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                className="input-field"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cook Time (minutes)
              </label>
              <input
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                className="input-field"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recipe Image</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image (optional)
              </label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer inline-flex items-center space-x-2 btn-secondary">
                  <Upload size={16} />
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {image && (
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null)
                      setImagePreview(null)
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {imagePreview && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Recipe preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center space-x-1 btn-secondary"
            >
              <Plus size={16} />
              <span>Add Ingredient</span>
            </button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                <input
                  type="text"
                  value={ingredient.text}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  className="flex-1 input-field"
                  placeholder="e.g., 2 cups all-purpose flour"
                  required
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Minus size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center space-x-1 btn-secondary"
            >
              <Plus size={16} />
              <span>Add Step</span>
            </button>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Step {index + 1}</h3>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus size={16} />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instruction *
                    </label>
                    <textarea
                      value={step.instruction}
                      onChange={(e) => updateStep(index, 'instruction', e.target.value)}
                      className="input-field resize-none"
                      rows={3}
                      placeholder="Describe what to do in this step..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timer (optional)
                    </label>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        value={Math.floor((step.timer_duration || 0) / 3600) || ''}
                        onChange={e => {
                          const hours = parseInt(e.target.value) || 0;
                          const minutes = Math.floor(((step.timer_duration || 0) % 3600) / 60);
                          const seconds = (step.timer_duration || 0) % 60;
                          updateStep(index, 'timer_duration', hours * 3600 + minutes * 60 + seconds);
                        }}
                        className="input-field w-16"
                        placeholder="hh"
                        aria-label="Hours"
                      />
                      <span className="text-sm text-gray-500">h</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={Math.floor(((step.timer_duration || 0) % 3600) / 60) || ''}
                        onChange={e => {
                          const minutes = parseInt(e.target.value) || 0;
                          const hours = Math.floor((step.timer_duration || 0) / 3600);
                          const seconds = (step.timer_duration || 0) % 60;
                          updateStep(index, 'timer_duration', hours * 3600 + minutes * 60 + seconds);
                        }}
                        className="input-field w-16"
                        placeholder="mm"
                        aria-label="Minutes"
                      />
                      <span className="text-sm text-gray-500">m</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={(step.timer_duration || 0) % 60 || ''}
                        onChange={e => {
                          const seconds = parseInt(e.target.value) || 0;
                          const hours = Math.floor((step.timer_duration || 0) / 3600);
                          const minutes = Math.floor(((step.timer_duration || 0) % 3600) / 60);
                          updateStep(index, 'timer_duration', hours * 3600 + minutes * 60 + seconds);
                        }}
                        className="input-field w-16"
                        placeholder="ss"
                        aria-label="Seconds"
                      />
                      <span className="text-sm text-gray-500">s</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Recipe'}
          </button>
        </div>
      </form>
    </div>
  )
}
