'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Play, Pause, RotateCcw, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Step {
  id: string
  step_number: number
  instruction: string
  timer_duration: number | null
}

interface Ingredient {
  id: string
  text: string
  order_index: number
}

interface Recipe {
  id: string
  title: string
  steps: Step[]
  ingredients: Ingredient[]
}

interface CookingPlayerProps {
  recipe: Recipe
}

export function CookingPlayer({ recipe }: CookingPlayerProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [timer, setTimer] = useState<number | null>(null)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerFinished, setTimerFinished] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const steps = recipe.steps
  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  // Initialize audio for timer completion
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    const createBeepSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }

    audioRef.current = { play: createBeepSound } as any
  }, [])

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timer !== null && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer(timer - 1)
      }, 1000)
    } else if (timer === 0 && isTimerRunning) {
      // Timer finished
      setIsTimerRunning(false)
      setTimerFinished(true)
      
      // Play sound
      if (audioRef.current) {
        try {
          audioRef.current.play()
        } catch (error) {
          console.log('Could not play timer sound')
        }
      }

      // Auto-advance to next step after 3 seconds
      setTimeout(() => {
        if (!isLastStep) {
          nextStep()
        }
      }, 3000)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timer, isTimerRunning, isLastStep])

  // Reset timer when step changes
  useEffect(() => {
    setTimer(currentStepData?.timer_duration || null)
    setIsTimerRunning(false)
    setTimerFinished(false)
  }, [currentStep, currentStepData])

  const startTimer = () => {
    if (timer !== null && timer > 0) {
      setIsTimerRunning(true)
      setTimerFinished(false)
    }
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
  }

  const resetTimer = () => {
    setTimer(currentStepData?.timer_duration || null)
    setIsTimerRunning(false)
    setTimerFinished(false)
  }

  const nextStep = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href={`/recipe/${recipe.id}`}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Recipe</span>
        </Link>
        
        <h1 className="text-xl font-semibold text-gray-900 text-center flex-1 mx-4">
          {recipe.title}
        </h1>
        
        <div className="text-sm text-gray-500">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Instruction */}
        <div className="lg:col-span-2">
          <div className="card p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                {currentStep + 1}
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Step {currentStep + 1}
              </h2>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {currentStepData?.instruction}
            </p>

            {/* Timer Section */}
            {currentStepData?.timer_duration && (
              <div className="mb-8">
                <div className="inline-flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock size={20} />
                    <span className="font-medium">Timer</span>
                  </div>
                  
                  <div className={`text-4xl font-bold ${
                    timerFinished ? 'text-green-600' : 
                    isTimerRunning ? 'text-primary-600' : 'text-gray-900'
                  }`}>
                    {timer !== null ? formatTime(timer) : '0:00'}
                  </div>

                  {timerFinished && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle size={20} />
                      <span className="font-medium">Timer Complete!</span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {!isTimerRunning ? (
                      <button
                        onClick={startTimer}
                        disabled={timer === 0 || timerFinished}
                        className="flex items-center space-x-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play size={16} />
                        <span>Start</span>
                      </button>
                    ) : (
                      <button
                        onClick={pauseTimer}
                        className="flex items-center space-x-1 btn-secondary"
                      >
                        <Pause size={16} />
                        <span>Pause</span>
                      </button>
                    )}
                    
                    <button
                      onClick={resetTimer}
                      className="flex items-center space-x-1 btn-secondary"
                    >
                      <RotateCcw size={16} />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevStep}
                disabled={isFirstStep}
                className="flex items-center space-x-2 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>

              {isLastStep ? (
                <button
                  onClick={() => router.push('/congratulations')}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <CheckCircle size={20} />
                  <span>Finish Cooking</span>
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 btn-primary"
                >
                  <span>Next</span>
                  <ArrowRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ingredients */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
            <ul className="space-y-2 text-sm">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient.id} className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">{ingredient.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Step Overview */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Steps</h3>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                    index === currentStep
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : index < currentStep
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Step {index + 1}</span>
                    {index < currentStep && <CheckCircle size={16} className="text-green-600" />}
                    {step.timer_duration && <Clock size={16} />}
                  </div>
                  <p className="mt-1 text-xs opacity-75 line-clamp-2">
                    {step.instruction}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
