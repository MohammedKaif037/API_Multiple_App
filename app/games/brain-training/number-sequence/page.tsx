"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Trophy, Timer, CheckCircle, XCircle, Calculator } from "lucide-react"
import Link from "next/link"
import { cognitiveAPI } from "@/lib/cognitive-api"

interface NumberSequence {
  id: string
  sequence: number[]
  pattern: string
  nextNumber: number
  difficulty: number
  explanation: string
}

export default function NumberSequenceGame() {
  const [currentSequence, setCurrentSequence] = useState<NumberSequence | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds] = useState(12)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [difficulty, setDifficulty] = useState(2)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const numberSequences: NumberSequence[] = [
    {
      id: "1",
      sequence: [2, 4, 6, 8, 10],
      pattern: "Add 2",
      nextNumber: 12,
      difficulty: 1,
      explanation: "Each number increases by 2",
    },
    {
      id: "2",
      sequence: [1, 4, 9, 16, 25],
      pattern: "Perfect squares",
      nextNumber: 36,
      difficulty: 2,
      explanation: "1², 2², 3², 4², 5², 6²",
    },
    {
      id: "3",
      sequence: [1, 1, 2, 3, 5, 8],
      pattern: "Fibonacci",
      nextNumber: 13,
      difficulty: 3,
      explanation: "Each number is the sum of the two preceding ones",
    },
    {
      id: "4",
      sequence: [3, 6, 12, 24, 48],
      pattern: "Multiply by 2",
      nextNumber: 96,
      difficulty: 2,
      explanation: "Each number is doubled",
    },
    {
      id: "5",
      sequence: [100, 90, 80, 70, 60],
      pattern: "Subtract 10",
      nextNumber: 50,
      difficulty: 1,
      explanation: "Each number decreases by 10",
    },
    {
      id: "6",
      sequence: [2, 6, 18, 54, 162],
      pattern: "Multiply by 3",
      nextNumber: 486,
      difficulty: 2,
      explanation: "Each number is multiplied by 3",
    },
    {
      id: "7",
      sequence: [1, 8, 27, 64, 125],
      pattern: "Perfect cubes",
      nextNumber: 216,
      difficulty: 3,
      explanation: "1³, 2³, 3³, 4³, 5³, 6³",
    },
    {
      id: "8",
      sequence: [5, 10, 20, 40, 80],
      pattern: "Multiply by 2",
      nextNumber: 160,
      difficulty: 2,
      explanation: "Each number is doubled",
    },
    {
      id: "9",
      sequence: [2, 3, 5, 7, 11, 13],
      pattern: "Prime numbers",
      nextNumber: 17,
      difficulty: 3,
      explanation: "Sequence of prime numbers",
    },
    {
      id: "10",
      sequence: [1, 3, 6, 10, 15],
      pattern: "Triangular numbers",
      nextNumber: 21,
      difficulty: 3,
      explanation: "1, 1+2, 1+2+3, 1+2+3+4, 1+2+3+4+5",
    },
    {
      id: "11",
      sequence: [7, 14, 21, 28, 35],
      pattern: "Multiples of 7",
      nextNumber: 42,
      difficulty: 1,
      explanation: "7×1, 7×2, 7×3, 7×4, 7×5, 7×6",
    },
    {
      id: "12",
      sequence: [1, 4, 7, 10, 13],
      pattern: "Add 3",
      nextNumber: 16,
      difficulty: 1,
      explanation: "Each number increases by 3",
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
    generateNextSequence()
  }

  const generateNextSequence = () => {
    const filteredSequences = numberSequences.filter((s) => s.difficulty <= difficulty)
    const randomSequence = filteredSequences[Math.floor(Math.random() * filteredSequences.length)]
    setCurrentSequence(randomSequence)
    setUserAnswer("")
    setShowResult(false)
  }

  const handleSubmit = () => {
    if (!currentSequence || showResult) return

    const userNum = Number.parseInt(userAnswer)
    const correct = userNum === currentSequence.nextNumber
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
          gameType: "number-sequence",
          difficulty,
          timeSpent: timeElapsed,
          cognitiveAreas: ["Mathematical Reasoning", "Pattern Recognition", "Logic"],
        })
      } else {
        setCurrentRound((prev) => prev + 1)
        generateNextSequence()
      }
    }, 3000)
  }

  const resetGame = () => {
    setGameStarted(false)
    setCurrentSequence(null)
    setUserAnswer("")
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
            <h1 className="text-3xl font-bold text-gray-900">Number Sequence</h1>
            <p className="text-gray-600">Find the pattern and predict the next number</p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Configure your number sequence challenge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select value={difficulty.toString()} onValueChange={(value) => setDifficulty(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Easy (Simple patterns)</SelectItem>
                    <SelectItem value="2">Medium (Moderate patterns)</SelectItem>
                    <SelectItem value="3">Hard (Complex patterns)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-600">
                <p>• Solve {totalRounds} number sequence puzzles</p>
                <p>• Identify mathematical patterns</p>
                <p>• Predict the next number in the sequence</p>
              </div>

              <Button onClick={startGame} className="w-full" size="lg">
                Start Challenge
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
            <h1 className="text-2xl font-bold text-gray-900">Number Sequence - Complete!</h1>
          </div>

          <Card className="max-w-md mx-auto bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-2">Excellent Work!</h3>
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

  if (!currentSequence) return null

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
            <h1 className="text-2xl font-bold text-gray-900">Number Sequence</h1>
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
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              What comes next in this sequence?
            </CardTitle>
            <CardDescription>Identify the pattern and find the next number</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Number Sequence */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-center">Number Sequence:</h3>
              <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 rounded-lg flex-wrap">
                {currentSequence.sequence.map((num, index) => (
                  <div key={index} className="flex items-center">
                    <div className="text-3xl font-bold bg-white p-4 rounded-lg border-2 border-gray-200 min-w-[80px] text-center">
                      {num}
                    </div>
                    {index < currentSequence.sequence.length - 1 && (
                      <div className="mx-2 text-gray-400 text-2xl">→</div>
                    )}
                  </div>
                ))}
                <div className="mx-2 text-gray-400 text-2xl">→</div>
                <div className="text-3xl font-bold bg-blue-50 p-4 rounded-lg border-2 border-blue-200 border-dashed min-w-[80px] text-center">
                  ?
                </div>
              </div>
            </div>

            {/* Answer Input */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">What's the next number?</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter the next number..."
                  className="text-lg text-center"
                  disabled={showResult}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                />
                <Button onClick={handleSubmit} disabled={showResult || !userAnswer.trim()}>
                  Submit
                </Button>
              </div>
            </div>

            {/* Result Feedback */}
            {showResult && (
              <div
                className={`p-4 rounded-lg ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </span>
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-l-blue-400">
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Pattern:</strong> {currentSequence.pattern}
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Answer:</strong> {currentSequence.nextNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Explanation:</strong> {currentSequence.explanation}
                  </p>
                </div>
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
