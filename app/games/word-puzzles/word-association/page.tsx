"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Clock, Zap, Target, RotateCcw, Play, Pause } from "lucide-react"

interface AssociationRound {
  id: number
  prompt: string
  category: string
  timeLimit: number
  responses: string[]
  startTime?: number
  endTime?: number
}

interface GameStats {
  totalWords: number
  averageTime: number
  categories: string[]
  longestStreak: number
  currentStreak: number
}

const WORD_PROMPTS = [
  { word: "OCEAN", category: "Nature", timeLimit: 30 },
  { word: "MUSIC", category: "Arts", timeLimit: 30 },
  { word: "KITCHEN", category: "Home", timeLimit: 30 },
  { word: "TRAVEL", category: "Adventure", timeLimit: 30 },
  { word: "FRIENDSHIP", category: "Emotions", timeLimit: 30 },
  { word: "TECHNOLOGY", category: "Modern", timeLimit: 30 },
  { word: "CHILDHOOD", category: "Memory", timeLimit: 30 },
  { word: "SPORTS", category: "Activity", timeLimit: 30 },
  { word: "BOOKS", category: "Learning", timeLimit: 30 },
  { word: "WEATHER", category: "Nature", timeLimit: 30 },
  { word: "FOOD", category: "Taste", timeLimit: 30 },
  { word: "COLORS", category: "Visual", timeLimit: 30 },
  { word: "ANIMALS", category: "Nature", timeLimit: 30 },
  { word: "DREAMS", category: "Mind", timeLimit: 30 },
  { word: "CELEBRATION", category: "Joy", timeLimit: 30 },
]

export default function WordAssociationGame() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "paused" | "finished">("menu")
  const [currentRound, setCurrentRound] = useState<AssociationRound | null>(null)
  const [currentInput, setCurrentInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(30)
  const [roundNumber, setRoundNumber] = useState(1)
  const [totalRounds] = useState(5)
  const [gameStats, setGameStats] = useState<GameStats>({
    totalWords: 0,
    averageTime: 0,
    categories: [],
    longestStreak: 0,
    currentStreak: 0,
  })
  const [allRounds, setAllRounds] = useState<AssociationRound[]>([])
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const difficultySettings = {
    easy: { timeLimit: 45, minWords: 3 },
    medium: { timeLimit: 30, minWords: 5 },
    hard: { timeLimit: 20, minWords: 7 },
  }

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && gameState === "playing") {
      handleRoundEnd()
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [timeLeft, gameState])

  const startGame = () => {
    setGameState("playing")
    setRoundNumber(1)
    setAllRounds([])
    setGameStats({
      totalWords: 0,
      averageTime: 0,
      categories: [],
      longestStreak: 0,
      currentStreak: 0,
    })
    startNewRound()
  }

  const startNewRound = () => {
    const promptData = WORD_PROMPTS[Math.floor(Math.random() * WORD_PROMPTS.length)]
    const timeLimit = difficultySettings[difficulty].timeLimit

    const newRound: AssociationRound = {
      id: roundNumber,
      prompt: promptData.word,
      category: promptData.category,
      timeLimit,
      responses: [],
      startTime: Date.now(),
    }

    setCurrentRound(newRound)
    setTimeLeft(timeLimit)
    setCurrentInput("")

    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentInput.trim() || !currentRound) return

    const newResponse = currentInput.trim().toLowerCase()

    // Check for duplicates
    if (currentRound.responses.includes(newResponse)) {
      setCurrentInput("")
      return
    }

    const updatedRound = {
      ...currentRound,
      responses: [...currentRound.responses, newResponse],
    }

    setCurrentRound(updatedRound)
    setCurrentInput("")

    // Update streak
    setGameStats((prev) => ({
      ...prev,
      currentStreak: prev.currentStreak + 1,
      longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1),
    }))
  }

  const handleRoundEnd = () => {
    if (!currentRound) return

    const endedRound = {
      ...currentRound,
      endTime: Date.now(),
    }

    setAllRounds((prev) => [...prev, endedRound])

    // Update stats
    setGameStats((prev) => {
      const newTotalWords = prev.totalWords + endedRound.responses.length
      const newCategories = [...new Set([...prev.categories, endedRound.category])]

      return {
        ...prev,
        totalWords: newTotalWords,
        categories: newCategories,
        currentStreak: 0,
      }
    })

    if (roundNumber < totalRounds) {
      setRoundNumber((prev) => prev + 1)
      setTimeout(() => {
        startNewRound()
      }, 2000)
    } else {
      setGameState("finished")
    }
  }

  const pauseGame = () => {
    setGameState("paused")
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const resumeGame = () => {
    setGameState("playing")
    inputRef.current?.focus()
  }

  const resetGame = () => {
    setGameState("menu")
    setCurrentRound(null)
    setAllRounds([])
    setRoundNumber(1)
    setTimeLeft(30)
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const getScoreColor = (wordCount: number) => {
    const minWords = difficultySettings[difficulty].minWords
    if (wordCount >= minWords * 1.5) return "text-green-600"
    if (wordCount >= minWords) return "text-blue-600"
    return "text-orange-600"
  }

  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-8 w-8 text-purple-600" />
              <h1 className="text-4xl font-bold text-gray-800">Word Association</h1>
            </div>
            <p className="text-lg text-gray-600">
              Think fast! Generate as many related words as possible for each prompt.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  How to Play
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-full p-1 mt-1">
                    <span className="text-purple-600 font-bold text-sm">1</span>
                  </div>
                  <p className="text-sm">You'll see a prompt word and category</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-full p-1 mt-1">
                    <span className="text-purple-600 font-bold text-sm">2</span>
                  </div>
                  <p className="text-sm">Type words that relate to the prompt</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-full p-1 mt-1">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                  <p className="text-sm">Beat the timer and aim for variety!</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Difficulty Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(["easy", "medium", "hard"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        difficulty === level
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{level}</span>
                        <span className="text-sm text-gray-600">
                          {difficultySettings[level].timeLimit}s • {difficultySettings[level].minWords}+ words
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button onClick={startGame} size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Play className="h-5 w-5 mr-2" />
              Start Game
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === "finished") {
    const totalWords = allRounds.reduce((sum, round) => sum + round.responses.length, 0)
    const averageWordsPerRound = totalWords / allRounds.length

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Game Complete!</h1>
            <p className="text-lg text-gray-600">Here's how you performed</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{totalWords}</div>
                <div className="text-sm text-gray-600">Total Words</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{averageWordsPerRound.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Avg per Round</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{gameStats.longestStreak}</div>
                <div className="text-sm text-gray-600">Longest Streak</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Round Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allRounds.map((round, index) => (
                  <div key={round.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          Round {index + 1}: {round.prompt}
                        </span>
                        <Badge variant="secondary">{round.category}</Badge>
                      </div>
                      <span className={`font-bold ${getScoreColor(round.responses.length)}`}>
                        {round.responses.length} words
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {round.responses.map((response, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {response}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-x-4">
            <Button onClick={startGame} className="bg-purple-600 hover:bg-purple-700">
              <Play className="h-4 w-4 mr-2" />
              Play Again
            </Button>
            <Button onClick={resetGame} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Back to Menu
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Game Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={pauseGame} variant="outline" size="sm">
              <Pause className="h-4 w-4" />
            </Button>
            <div className="text-sm text-gray-600">
              Round {roundNumber} of {totalRounds}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className={`font-bold ${timeLeft <= 10 ? "text-red-600" : "text-gray-800"}`}>{timeLeft}s</span>
          </div>
        </div>

        <Progress value={(timeLeft / difficultySettings[difficulty].timeLimit) * 100} className="mb-6" />

        {gameState === "paused" && (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-4">Game Paused</h2>
              <Button onClick={resumeGame} className="bg-purple-600 hover:bg-purple-700">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            </CardContent>
          </Card>
        )}

        {currentRound && (
          <>
            {/* Current Prompt */}
            <Card className="mb-6">
              <CardContent className="p-8 text-center">
                <Badge className="mb-4">{currentRound.category}</Badge>
                <h2 className="text-4xl font-bold text-purple-600 mb-4">{currentRound.prompt}</h2>
                <p className="text-gray-600">What words come to mind? Type as many as you can!</p>
              </CardContent>
            </Card>

            {/* Input Form */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <form onSubmit={handleInputSubmit} className="flex gap-4">
                  <Input
                    ref={inputRef}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Type a related word..."
                    className="flex-1"
                    disabled={gameState !== "playing"}
                  />
                  <Button type="submit" disabled={!currentInput.trim() || gameState !== "playing"}>
                    Add Word
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Current Responses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Your Words ({currentRound.responses.length})</span>
                  <Badge
                    variant={
                      currentRound.responses.length >= difficultySettings[difficulty].minWords ? "default" : "secondary"
                    }
                  >
                    Target: {difficultySettings[difficulty].minWords}+
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentRound.responses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentRound.responses.map((response, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {response}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Start typing words related to "{currentRound.prompt}"
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
