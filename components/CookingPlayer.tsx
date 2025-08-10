'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Play, Pause, RotateCcw, Clock, CheckCircle, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import { generateSpeech } from '@/lib/tts'

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
  const ttsRef = useRef<HTMLAudioElement | null>(null)
  const [isTtsEnabled, setIsTtsEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const steps = recipe.steps
  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  // Start overlay state
  const [hasStarted, setHasStarted] = useState(false)

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

  // Reset timer and automatically start grace period when step changes, but only after recipe is started
  useEffect(() => {
    setTimer(currentStepData?.timer_duration || null)
    setIsTimerRunning(false)
    setTimerFinished(false)
    if (hasStarted) {
      if (currentStepData?.timer_duration) {
        setIsGracePeriod(true)
        setGraceSecondsLeft(10)
      } else {
        setIsGracePeriod(false)
        setGraceSecondsLeft(10)
      }
    }
  }, [currentStep, currentStepData, hasStarted])

  // Play TTS only when timer is started for a step
  useEffect(() => {
    if (isTtsEnabled && isTimerRunning && currentStepData) {
      playStepInstruction(currentStepData.instruction)
    }
  }, [isTtsEnabled, isTimerRunning, currentStepData])

  // Function to play step instruction using TTS
  const playStepInstruction = async (text: string) => {
    // Stop any currently playing audio
    if (ttsRef.current) {
      ttsRef.current.pause()
      ttsRef.current.src = ''
    }

    try {
      setError(null)
      setIsLoading(true)
      const audioData = await generateSpeech(text)
      const blob = new Blob([audioData], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)

      const audio = new Audio(url)
      ttsRef.current = audio

      // Set up event listeners
      audio.onerror = (e) => {
        console.error('Audio playback error:', e)
        setError('Failed to play audio')
        setIsTtsEnabled(false)
      }

      audio.onended = () => {
        URL.revokeObjectURL(url)
      }

      await audio.play()
    } catch (error) {
      console.error('Error playing TTS:', error)
      let message = 'Failed to play audio'
      if (error instanceof Error) {
        message = error.message
        // Detect rate limit or max token error from API response
        if (/max token|rate limit|quota/i.test(message)) {
          message = 'TTS AI rate limit reached or max token usage exceeded. Please try again later.'
        }
      }
      setError(message)
      setIsTtsEnabled(false) // Automatically disable TTS on error
    } finally {
      setIsLoading(false)
    }
  }

  // Clean up TTS audio on unmount
  useEffect(() => {
    return () => {
      if (ttsRef.current) {
        ttsRef.current.pause()
        ttsRef.current = null
      }
    }
  }, [])

  // Grace period state
  const [isGracePeriod, setIsGracePeriod] = useState(false)
  const [graceSecondsLeft, setGraceSecondsLeft] = useState(10)
  const graceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Start timer with grace period
  const startTimer = () => {
    if (timer !== null && timer > 0 && !isGracePeriod && !isTimerRunning) {
      setIsGracePeriod(true)
      setGraceSecondsLeft(10)
    }
  }

  // Grace period countdown effect
  useEffect(() => {
    if (isGracePeriod) {
      graceTimerRef.current = setInterval(() => {
        setGraceSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(graceTimerRef.current!)
            setIsGracePeriod(false)
            setIsTimerRunning(true)
            setTimerFinished(false)
            return 10
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (graceTimerRef.current) {
        clearInterval(graceTimerRef.current)
      }
    }
  }, [isGracePeriod])

  // Cancel grace period on step change
  useEffect(() => {
    setIsGracePeriod(false)
    setGraceSecondsLeft(10)
    if (graceTimerRef.current) {
      clearInterval(graceTimerRef.current)
    }
  }, [currentStep])

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
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      {/* Start Recipe Overlay */}
      {!hasStarted && (
        <div className="absolute inset-0 bg-white bg-opacity-90 z-50 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold mb-4 text-primary-700">Ready to Cook?</h2>
          <p className="mb-6 text-lg text-gray-700">Press start to begin the recipe and see step 1.</p>
          <button
            className="px-6 py-3 bg-primary-600 text-white rounded-lg text-xl font-semibold shadow hover:bg-primary-700 transition-colors"
            onClick={() => setHasStarted(true)}
          >
            Start Recipe
          </button>
        </div>
      )}

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
          <div className="card p-8 text-center relative">
            {/* Sound Icon Top Right */}
            <div className="absolute top-4 right-4 flex items-center z-10">
              {error && (
                <div className="mr-4 text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                  {error}
                </div>
              )}
              <button
                onClick={() => {
                  setIsTtsEnabled(!isTtsEnabled)
                  setError(null) // Clear error when toggling
                  if (!isTtsEnabled && currentStepData) {
                    // Try to play audio again when enabling
                    playStepInstruction(currentStepData.instruction)
                  }
                }}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label={isTtsEnabled ? "Disable voice instructions" : "Enable voice instructions"}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
                ) : isTtsEnabled ? (
                  <Volume2 size={24} />
                ) : (
                  <VolumeX size={24} />
                )}
              </button>
            </div>
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                {currentStep + 1}
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Step {currentStep + 1}
              </h2>
              {/* TTS Test Button */}
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/tts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ text: 'Testing text to speech API.' })
                    });

                    if (!response.ok) {
                      const error = await response.json();
                      console.error('TTS Error:', error);
                      return;
                    }

                    const audioBlob = await response.blob();
                    const url = URL.createObjectURL(audioBlob);
                    const audio = new Audio(url);
                    audio.onended = () => URL.revokeObjectURL(url);
                    await audio.play();
                  } catch (error) {
                    console.error('TTS Error:', error);
                  }
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
              >
                Test TTS
              </button>
            </div>

            <div className="relative">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                {currentStepData?.instruction}
              </p>
            </div>

            {/* Timer Section */}
            {currentStepData?.timer_duration && (
              <div className="mb-8">
                <div className="inline-flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock size={20} />
                    <span className="font-medium">Timer</span>
                  </div>

                  {/* Enhanced Grace period indicator */}
                  {isGracePeriod ? (
                    <div className="flex flex-col items-center w-full">
                      <div className="text-lg font-semibold text-yellow-700 mb-2">
                        Get ready! Timer will start soon
                      </div>
                      <div className="w-full bg-yellow-100 rounded-full h-3 mb-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 h-3 rounded-full animate-grace-progress"
                          style={{ width: `${((10 - graceSecondsLeft) / 10) * 100}%`, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }}
                        />
                      </div>
                      <div className="text-3xl font-bold text-yellow-600 mb-2">
                        {graceSecondsLeft} second{graceSecondsLeft !== 1 ? 's' : ''} left
                      </div>
                      <button
                        onClick={() => {
                          setIsGracePeriod(false)
                          setGraceSecondsLeft(10)
                          if (graceTimerRef.current) {
                            clearInterval(graceTimerRef.current)
                          }
                        }}
                        className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 shadow"
                      >
                        Skip Grace Period
                      </button>
                    </div>
                  ) : (
                    <div className={`text-4xl font-bold ${
                      timerFinished ? 'text-green-600' : 
                      isTimerRunning ? 'text-primary-600' : 'text-gray-900'
                    }`}>
                      {timer !== null ? formatTime(timer) : '0:00'}
                    </div>
                  )}

                  {timerFinished && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle size={20} />
                      <span className="font-medium">Timer Complete!</span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {!isTimerRunning && !isGracePeriod ? (
                      <button
                        onClick={startTimer}
                        disabled={timer === 0 || timerFinished}
                        className="flex items-center space-x-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play size={16} />
                        <span>Start</span>
                      </button>
                    ) : isTimerRunning ? (
                      <button
                        onClick={pauseTimer}
                        className="flex items-center space-x-1 btn-secondary"
                      >
                        <Pause size={16} />
                        <span>Pause</span>
                      </button>
                    ) : null}
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
