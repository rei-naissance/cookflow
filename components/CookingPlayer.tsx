'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Play, Pause, RotateCcw, Clock, CheckCircle, Volume2, VolumeX, ChefHat, Timer } from 'lucide-react'
import { motion } from 'framer-motion'
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
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      {/* Start Recipe Overlay */}
      {!hasStarted && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full p-8 text-center animate-slide-up">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <ChefHat size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-foreground">Ready to Cook?</h2>
            <p className="mb-8 text-muted-foreground text-lg">We'll guide you step-by-step through this recipe.</p>
            <button
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-lg font-semibold shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all"
              onClick={() => setHasStarted(true)}
            >
              Start Cooking
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href={`/recipe/${recipe.id}`}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back to Recipe</span>
        </Link>

        <h1 className="text-xl font-bold text-foreground text-center flex-1 mx-4 line-clamp-1">
          {recipe.title}
        </h1>

        <div className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          Step {currentStep + 1}/{steps.length}
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="mb-8 flex gap-2 sm:gap-3 h-2.5">
        {steps.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-full rounded-full bg-secondary relative overflow-hidden group border border-transparent transition-all"
          >
            <motion.div
              initial={false}
              animate={{
                width: index <= currentStep ? '100%' : '0%',
                opacity: index <= currentStep ? 1 : 0
              }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: index <= currentStep ? index * 0.05 : 0 // Subtle stagger
              }}
              className={`h-full rounded-full shadow-sm ${index === currentStep ? "bg-primary relative" : "bg-primary/80"}`}
            >
              {index === currentStep && (
                <motion.div
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-white/20 rounded-full"
                />
              )}
            </motion.div>

            {/* Tooltip on hover */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold">
              Step {index + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Instruction */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {/* Sound Icon Top Right */}
            <div className="absolute top-4 right-4 flex items-center z-10 gap-3">
              {error && (
                <div className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded-md border border-destructive/20 animate-in fade-in slide-in-from-top-1">
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
                className={`p-2 rounded-full transition-all ${isTtsEnabled ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
                aria-label={isTtsEnabled ? "Disable voice instructions" : "Enable voice instructions"}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                ) : isTtsEnabled ? (
                  <Volume2 size={20} />
                ) : (
                  <VolumeX size={20} />
                )}
              </button>
            </div>

            <div className="mb-8">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg mb-4">
                {currentStep + 1}
              </span>
              <h2 className="text-2xl font-bold text-foreground">
                Step {currentStep + 1}
              </h2>
            </div>

            <div className="relative min-h-[120px] flex items-center justify-center">
              <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed font-medium max-w-2xl mx-auto">
                {currentStepData?.instruction}
              </p>
            </div>
          </div>

          {/* Timer Section */}
          <div className={`transition-all duration-500 ${currentStepData?.timer_duration ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none absolute'}`}>
            {currentStepData?.timer_duration && (
              <div className="card p-6 border-l-4 border-l-primary/50 relative overflow-hidden">
                <div className="absolute right-0 top-0 p-3 opacity-5">
                  <Clock size={120} />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                      <Timer size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">Timer Required</h3>
                      <p className="text-sm text-muted-foreground">This step needs precise timing</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    {/* Enhanced Grace period indicator */}
                    {isGracePeriod ? (
                      <div className="flex flex-col items-center w-full min-w-[200px]">
                        <div className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                          Starting in...
                        </div>
                        <div className="text-4xl font-mono font-bold text-amber-600 dark:text-amber-400 mb-3 tabular-nums">
                          0:{graceSecondsLeft.toString().padStart(2, '0')}
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 mb-4 overflow-hidden">
                          <div
                            className="bg-amber-500 h-2 rounded-full transition-all duration-1000 linear"
                            style={{ width: `${((graceSecondsLeft) / 10) * 100}%` }}
                          />
                        </div>
                        <button
                          onClick={() => {
                            setIsGracePeriod(false)
                            setGraceSecondsLeft(10)
                            if (graceTimerRef.current) {
                              clearInterval(graceTimerRef.current)
                            }
                          }}
                          className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline"
                        >
                          Skip countdown
                        </button>
                      </div>
                    ) : (
                      <div className={`text-5xl font-mono font-bold tracking-tight tabular-nums ${timerFinished ? 'text-green-500 animate-pulse' :
                        isTimerRunning ? 'text-primary' : 'text-foreground'
                        }`}>
                        {timer !== null ? formatTime(timer) : '0:00'}
                      </div>
                    )}

                    {timerFinished && (
                      <div className="flex items-center space-x-2 text-green-500 text-sm font-medium mt-1">
                        <CheckCircle size={14} />
                        <span>Complete! Next step in 3s...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isTimerRunning && !isGracePeriod ? (
                      <button
                        onClick={startTimer}
                        disabled={timer === 0 || timerFinished}
                        className="btn-primary"
                      >
                        <Play size={16} className="mr-2" />
                        Start
                      </button>
                    ) : isTimerRunning ? (
                      <button
                        onClick={pauseTimer}
                        className="btn-secondary"
                      >
                        <Pause size={16} className="mr-2" />
                        Pause
                      </button>
                    ) : null}
                    <button
                      onClick={resetTimer}
                      className="p-2.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Reset Timer"
                    >
                      <RotateCcw size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-8 border-t border-border">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary text-foreground"
            >
              <ArrowLeft size={20} />
              <span>Previous</span>
            </button>

            {isLastStep ? (
              <button
                onClick={() => router.push('/congratulations')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-lg shadow-green-600/20 hover:scale-105"
              >
                <CheckCircle size={20} />
                <span>Finish Cooking</span>
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 btn-primary py-3 px-8 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                <span>Next Step</span>
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ingredients */}
          <div className="card p-6 h-fit bg-secondary/20 border-transparent">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              Ingredients
            </h3>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient.id} className="flex items-start gap-3 text-sm group">
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${steps.slice(0, currentStep + 1).some(s => s.instruction.toLowerCase().includes(ingredient.text.toLowerCase())) // Simple heuristic: highlight if potentially used
                    ? 'bg-primary'
                    : 'bg-muted-foreground/40 group-hover:bg-primary/50'
                    }`}></div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">{ingredient.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Step Overview */}
          <div className="card p-6 h-fit border-border/60">
            <h3 className="text-lg font-bold text-foreground mb-4">Steps Overview</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-secondary">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${index === currentStep
                    ? 'bg-primary/5 border-primary/20 text-foreground ring-1 ring-primary/20'
                    : index < currentStep
                      ? 'bg-secondary/50 border-transparent text-muted-foreground/80 hover:bg-secondary'
                      : 'bg-transparent border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-semibold ${index === currentStep ? 'text-primary' : ''}`}>Step {index + 1}</span>
                    <div className="flex items-center gap-2">
                      {index < currentStep && <CheckCircle size={14} className="text-green-500" />}
                      {step.timer_duration && <Clock size={14} className={index === currentStep ? 'text-primary' : 'text-muted-foreground'} />}
                    </div>
                  </div>
                  <p className="text-xs line-clamp-2 opacity-80">
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
