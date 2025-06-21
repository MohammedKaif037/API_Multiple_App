"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Trophy, Timer, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { cognitiveAPI } from "@/lib/cognitive-api"

interface Pattern {
  id: string
  sequence: string[]
  options: string[]
  correctAnswer: string
  difficulty: number
}

export default function PatternRecognitionGame() {
  const [currentPattern, setCurrentPattern] = useState<Pattern | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds] = useState(10)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [difficulty, setDifficulty] = useState(2)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [loading, setLoading] = useState(false)

  const patterns: Pattern[] = [
    {
      id: "1",
      sequence: ["🔴", "🔵", "🔴", "🔵", "🔴"],
      options: ["🔵", "🔴", "🟡", "🟢"],
      correctAnswer: "🔵",
      difficulty: 1,
    },
    {
      id: "2",
      sequence: ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐"],
      options: ["⭐⭐⭐⭐⭐", "⭐⭐⭐", "⭐⭐", "⭐"],
      correctAnswer: "⭐⭐⭐⭐⭐",
      difficulty: 2,
    },
    {
      id: "3",
      sequence: ["🔺", "🔵", "🔺🔺", "🔵🔵", "🔺🔺🔺"],
      options: ["🔵🔵🔵", "🔺🔺🔺🔺", "🔵🔵", "🔺"],
      correctAnswer: "🔵🔵🔵",
      difficulty: 2,
    },
    {
      id: "4",
      sequence: ["1", "4", "9", "16"],
      options: ["20", "25", "24", "21"],
      correctAnswer: "25",
      difficulty: 3,
    },
    {
      id: "5",
      sequence: ["🟢", "🟡", "🔴", "🟢", "🟡"],
      options: ["🔴", "🟢", "🟡", "🔵"],
      correctAnswer: "🔴",
      difficulty: 1,
    },
    {
      id: "6",
      sequence: ["A", "C", "E", "G"],
      options: ["H", "I", "J", "K"],
      correctAnswer: "I",
      difficulty: 3,
    },
    {
      id: "7",
      sequence: ["🔸", "🔹", "🔸🔸", "🔹🔹", "🔸🔸🔸"],
      options: ["🔹🔹🔹", "🔸🔸🔸🔸", "🔹🔹", "🔸"],
      correctAnswer: "🔹🔹🔹",
      difficulty: 2,
    },
    {
      id: "8",
      sequence: ["2", "6", "18", "54"],
      options: ["108", "162", "216", "180"],
      correctAnswer: "162",
      difficulty: 3,
    },
    {
      id: "9",
      sequence: ["🌙", "🌙🌙", "🌙", "🌙🌙", "🌙"],
      options: ["🌙🌙", "🌙", "🌙🌙🌙", "🌟"],
      correctAnswer: "🌙🌙",
      difficulty: 1,
    },
    {
      id: "10",
      sequence: ["🔲", "🔳", "🔲🔲", "🔳🔳", "🔲🔲🔲"],
      options: ["🔳🔳🔳", "🔲🔲🔲🔲", "🔳🔳", "🔲"],
      correctAnswer: "🔳🔳🔳",
      difficulty: 2,
    },
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStarted, gameCompleted])

  const startGame = () => {
    setGameStarted(true)
    setCurrentRound(1)
    setScore(0)
    setTimeElapsed(0)
    setGameCompleted(false)
    generateNextPattern()
  }

  const generateNextPattern = () => {
    const filteredPatterns = patterns.filter((p) => p.difficulty <= difficulty)
    const randomPattern = filteredPatterns[Math.floor(Math.random() * filteredPatterns.length)]
    setCurrentPattern(randomPattern)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return

    setSelectedAnswer(answer)
    const correct = answer === currentPattern?.correctAnswer
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore((prev) => prev + 1)
    }

    setTimeout(() => {
      if (currentRound >= totalRounds) {
        setGameCompleted(true)
        const finalScore = Math.round((score / totalRounds) * 100)

        // Track progress
        cognitiveAPI.trackProgress({
          date: new Date().toISOString(),
          score: finalScore,
          gameType: "pattern-recognition",
          difficulty,
          timeSpent: timeElapsed,
          cognitiveAreas: ["Pattern Recognition", "Visual Processing", "Logic"],
        })
      } else {
        setCurrentRound((prev) => prev + 1)
        generateNextPattern()
      }
    }, 2000)
  }

  const resetGame = () => {
    setGameStarted(false)
    setCurrentPattern(null)
    setSelectedAnswer(null)
    setScore(0)
    setCurrentRound(1)
    setTimeElapsed(0)
    setGameCompleted(false)
    setShowResult(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getFinalScore = () => {
    return Math.round((score / totalRounds) * 100)
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/games/brain-training">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Brain Training
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Pattern Recognition</h1>
            <p className="text-gray-600">Identify and complete visual and logical patterns</p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Configure your pattern recognition challenge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select value={difficulty.toString()} onValueChange={(value) => setDifficulty(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Easy</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-600">
                <p>• Complete {totalRounds} pattern challenges</p>
                <p>• Identify the next element in each sequence</p>
                <p>• Higher difficulty includes more complex patterns</p>
              </div>

              <Button onClick={startGame} className="w-full" size="lg">
                Start Game
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/games/brain-training">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Brain Training
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Pattern Recognition - Complete!</h1>
          </div>

          <Card className="max-w-md mx-auto bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-2">Game Complete!</h3>
                <div className="space-y-2 text-green-700">
                  <p>
                    Score: {score}/{totalRounds} ({getFinalScore()}%)
                  </p>
                  <p>Time: {formatTime(timeElapsed)}</p>
                  <p>Difficulty: Level {difficulty}</p>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={resetGame} className="flex-1">
                    Play Again
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/games/brain-training">Back to Games</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!currentPattern) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button asChild variant="ghost" className="mb-2">
              <Link href="/games/brain-training">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Brain Training
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Pattern Recognition</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {formatTime(timeElapsed)}
            </Badge>
            <Badge variant="outline">
              Round: {currentRound}/{totalRounds}
            </Badge>
            <Badge variant="outline">
              Score: {score}/{totalRounds}
            </Badge>
          </div>
        </div>

        {/* Game Area */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>What comes next in this pattern?</CardTitle>
            <CardDescription>Analyze the sequence and select the correct answer</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Pattern Sequence */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Pattern Sequence:</h3>
              <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 rounded-lg">
                {currentPattern.sequence.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="text-3xl font-bold bg-white p-4 rounded-lg border-2 border-gray-200 min-w-[80px] text-center">
                      {item}
                    </div>
                    {index < currentPattern.sequence.length - 1 && <div className="mx-2 text-gray-400">→</div>}
                  </div>
                ))}
                <div className="mx-2 text-gray-400">→</div>
                <div className="text-3xl font-bold bg-blue-50 p-4 rounded-lg border-2 border-blue-200 min-w-[80px] text-center border-dashed">
                  ?
                </div>
              </div>
            </div>

            {/* Answer Options */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose the correct answer:</h3>
              <div className="grid grid-cols-2 gap-4">
                {currentPattern.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === option ? (isCorrect ? "default" : "destructive") : "outline"}
                    className={`h-20 text-2xl font-bold ${
                      showResult && option === currentPattern.correctAnswer
                        ? "bg-green-100 border-green-400 text-green-800"
                        : ""
                    }`}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showResult}
                  >
                    <div className="flex items-center gap-2">
                      {option}
                      {showResult &&
                        selectedAnswer === option &&
                        (isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ))}
                      {showResult && option === currentPattern.correctAnswer && selectedAnswer !== option && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Result Feedback */}
            {showResult && (
              <div
                className={`mt-6 p-4 rounded-lg ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
              >
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </span>
                </div>
                {!isCorrect && (
                  <p className="text-red-700 mt-2">
                    The correct answer was: <strong>{currentPattern.correctAnswer}</strong>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="max-w-2xl mx-auto mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">
                {currentRound}/{totalRounds}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentRound / totalRounds) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
