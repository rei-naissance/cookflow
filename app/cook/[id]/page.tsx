import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { notFound } from 'next/navigation'
import { CookingPlayer } from '@/components/CookingPlayer'

export default async function CookPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  
  // Fetch recipe with steps and ingredients
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select(`
      *,
      ingredients(id, text, order_index),
      steps(id, step_number, instruction, timer_duration)
    `)
    .eq('id', params.id)
    .single()

  if (error || !recipe) {
    notFound()
  }

  // Sort steps by step number
  // const sortedSteps = recipe.steps?.sort((a, b) => a.step_number - b.step_number) || []
  // const sortedIngredients = recipe.ingredients?.sort((a, b) => a.order_index - b.order_index) || []

  const sortedSteps = Array.isArray(recipe.steps)
    ? [...recipe.steps].sort((a, b) => a.step_number - b.step_number)
    : []

  const sortedIngredients = Array.isArray(recipe.ingredients)
    ? [...recipe.ingredients].sort((a, b) => a.order_index - b.order_index)
    : []
  
  return (
    <div className="min-h-screen bg-gray-50">
      <CookingPlayer 
        recipe={{
          ...recipe,
          steps: sortedSteps,
          ingredients: sortedIngredients
        }} 
      />
    </div>
  )
}
