"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Trophy, Timer, CheckCircle, XCircle, Lightbulb } from "lucide-react"
import Link from "next/link"
import { cognitiveAPI } from "@/lib/cognitive-api"

interface AnagramChallenge {
  id: string
  scrambledWord: string
  correctWord: string
  hint: string
  difficulty: number
  category: string
}

export default function AnagramSolverGame() {
  const [currentChallenge, setCurrentChallenge] = useState<AnagramChallenge | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds] = useState(10)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [difficulty, setDifficulty] = useState(2)
  const [category, setCategory] = useState("general")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [loading, setLoading] = useState(false)

  const anagramChallenges: AnagramChallenge[] = [
    {
      id: "1",
      scrambledWord: "TAC",
      correctWord: "CAT",
      hint: "A furry pet that meows",
      difficulty: 1,
      category: "animals",
    },
    {
      id: "2",
      scrambledWord: "EGNARD",
      correctWord: "GARDEN",
      hint: "A place where flowers grow",
      difficulty: 2,
      category: "nature",
    },
    {
      id: "3",
      scrambledWord: "TNEMELE",
      correctWord: "ELEMENT",
      hint: "Basic substance in chemistry",
      difficulty: 3,
      category: "science",
    },
    {
      id: "4",
      scrambledWord: "NAITNUOM",
      correctWord: "MOUNTAIN",
      hint: "A very tall hill",
      difficulty: 2,
      category: "nature",
    },
    {
      id: "5",
      scrambledWord: "RETAW",
      correctWord: "WATER",
      hint: "Essential liquid for life",
      difficulty: 1,
      category: "general",
    },
    {
      id: "6",
      scrambledWord: "RETUPMOC",
      correctWord: "COMPUTER",
      hint: "Electronic device for processing data",
      difficulty: 3,
      category: "technology",
    },
    {
      id: "7",
      scrambledWord: "KOOB",
      correctWord: "BOOK",
      hint: "You read this",
      difficulty: 1,
      category: "general",
    },
    {
      id: "8",
      scrambledWord: "ECNEICS",
      correctWord: "SCIENCE",
      hint: "Study of the natural world",
      difficulty: 2,
      category: "education",
    },
    {
      id: "9",
      scrambledWord: "YTIVARG",
      correctWord: "GRAVITY",
      hint: "Force that pulls objects down",
      difficulty: 3,
      category: "science",
    },
    {
      id: "10",
      scrambledWord: "DNEIRF",
      correctWord: "FRIEND",
      hint: "Someone you like and trust",
      difficulty: 2,
      category: "general",
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
    generateNextChallenge()
  }

  const generateNextChallenge = () => {
    const filteredChallenges = anagramChallenges.filter((c) => c.difficulty <= difficulty)
    const randomChallenge = filteredChallenges[Math.floor(Math.random() * filteredChallenges.length)]
    setCurrentChallenge(randomChallenge)
    setUserAnswer("")
    setShowResult(false)
    setShowHint(false)
  }

  const handleSubmit = () => {
    if (!currentChallenge || showResult) return

    const correct = userAnswer.toUpperCase().trim() === currentChallenge.correctWord.toUpperCase()
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
          gameType: "anagram-solver",
          difficulty,
          timeSpent: timeElapsed,
          cognitiveAreas: ["Language", "Problem Solving", "Pattern Recognition"],
        })
      } else {
        setCurrentRound((prev) => prev + 1)
        generateNextChallenge()
      }
    }, 2000)
  }

  const resetGame = () => {
    setGameStarted(false)
    setCurrentChallenge(null)
    setUserAnswer("")
    setScore(0)
    setCurrentRound(1)
    setTimeElapsed(0)
    setGameCompleted(false)
    setShowResult(false)
    setShowHint(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getFinalScore = () => {
    return Math.round((score / totalRounds) * 100)
  }

  const scrambleLetters = (word: string) => {
    return word.split("").map((letter, index) => (
      <span
        key={index}
        className="inline-block bg-blue-100 border-2 border-blue-300 rounded-lg px-3 py-2 mx-1 text-xl font-bold text-blue-800"
      >
        {letter}
      </span>
    ))
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/games/word-puzzles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Word Puzzles
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Anagram Solver</h1>
            <p className="text-gray-600">Unscramble letters to form words</p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Configure your anagram challenge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select value={difficulty.toString()} onValueChange={(value) => setDifficulty(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Easy (3-5 letters)</SelectItem>
                    <SelectItem value="2">Medium (5-7 letters)</SelectItem>
                    <SelectItem value="3">Hard (7+ letters)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="animals">Animals</SelectItem>
                    <SelectItem value="nature">Nature</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-600">
                <p>• Solve {totalRounds} anagram puzzles</p>
                <p>• Unscramble letters to form words</p>
                <p>• Use hints if you get stuck</p>
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
              <Link href="/games/word-puzzles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Word Puzzles
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Anagram Solver - Complete!</h1>
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
                    <Link href="/games/word-puzzles">Back to Games</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!currentChallenge) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button asChild variant="ghost" className="mb-2">
              <Link href="/games/word-puzzles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Word Puzzles
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Anagram Solver</h1>
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
            <CardTitle>Unscramble the letters to form a word</CardTitle>
            <CardDescription>Category: {currentChallenge.category}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Scrambled Letters */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-center">Scrambled Letters:</h3>
              <div className="flex justify-center items-center flex-wrap gap-2 p-6 bg-gray-50 rounded-lg">
                {scrambleLetters(currentChallenge.scrambledWord)}
              </div>
            </div>

            {/* Answer Input */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Your Answer:</label>
              <div className="flex gap-2">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter the unscrambled word..."
                  className="text-lg"
                  disabled={showResult}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                />
                <Button onClick={handleSubmit} disabled={showResult || !userAnswer.trim()}>
                  Submit
                </Button>
              </div>
            </div>

            {/* Hint */}
            <div className="mb-6">
              {!showHint ? (
                <Button variant="outline" onClick={() => setShowHint(true)} className="w-full" disabled={showResult}>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Show Hint
                </Button>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Lightbulb className="h-4 w-4" />
                    <span className="font-medium">Hint:</span>
                  </div>
                  <p className="text-yellow-700 mt-1">{currentChallenge.hint}</p>
                </div>
              )}
            </div>

            {/* Result Feedback */}
            {showResult && (
              <div
                className={`p-4 rounded-lg ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
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
                    The correct answer was: <strong>{currentChallenge.correctWord}</strong>
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
