"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Check, RotateCcw, Lightbulb, Trophy } from "lucide-react"
import Link from "next/link"
import { cognitiveAPI, type CrosswordPuzzle } from "@/lib/cognitive-api"

export default function CrosswordGame() {
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [selectedClue, setSelectedClue] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState(2)
  const [theme, setTheme] = useState("general")
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [loading, setLoading] = useState(false)

  // Enhanced crossword data
  const crosswordData: CrosswordPuzzle = {
    id: "crossword_1",
    grid: [
      ["E", "L", "E", "P", "H", "A", "N", "T", "", ""],
      ["", "", "", "", "", "", "", "R", "", ""],
      ["", "B", "E", "E", "", "", "", "E", "", ""],
      ["", "", "", "", "", "", "", "E", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "A", "P", "P", "L", "E", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
    ],
    clues: {
      across: [
        { number: 1, clue: "Large gray mammal with trunk", answer: "ELEPHANT", startRow: 0, startCol: 0 },
        { number: 3, clue: "Flying insect that makes honey", answer: "BEE", startRow: 2, startCol: 1 },
        { number: 5, clue: "Red fruit that grows on trees", answer: "APPLE", startRow: 5, startCol: 4 },
      ],
      down: [
        { number: 2, clue: "Tall plant with leaves", answer: "TREE", startRow: 0, startCol: 7 },
        { number: 4, clue: "Breakfast food from chickens", answer: "EGG", startRow: 0, startCol: 0 },
      ],
    },
    difficulty: 2,
    theme: "animals",
  }

  useEffect(() => {
    setPuzzle(crosswordData)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStarted, gameCompleted])

  const startGame = async () => {
    setLoading(true)
    try {
      const response = await cognitiveAPI.generateCrossword(theme, difficulty)
      if (response.success && response.data) {
        setPuzzle(response.data)
      } else {
        // Use default puzzle if API fails
        setPuzzle(crosswordData)
      }
      setGameStarted(true)
      setTimeElapsed(0)
      setScore(0)
      setUserAnswers({})
      setGameCompleted(false)
    } catch (error) {
      setPuzzle(crosswordData)
      setGameStarted(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCellInput = (row: number, col: number, value: string) => {
    const key = `${row}-${col}`
    setUserAnswers((prev) => ({
      ...prev,
      [key]: value.toUpperCase(),
    }))
  }

  const checkAnswers = () => {
    if (!puzzle) return

    let correctAnswers = 0
    let totalAnswers = 0

    // Check across answers
    puzzle.clues.across.forEach((clue) => {
      let isCorrect = true
      for (let i = 0; i < clue.answer.length; i++) {
        const key = `${clue.startRow}-${clue.startCol + i}`
        if (userAnswers[key] !== clue.answer[i]) {
          isCorrect = false
          break
        }
      }
      if (isCorrect) correctAnswers++
      totalAnswers++
    })

    // Check down answers
    puzzle.clues.down.forEach((clue) => {
      let isCorrect = true
      for (let i = 0; i < clue.answer.length; i++) {
        const key = `${clue.startRow + i}-${clue.startCol}`
        if (userAnswers[key] !== clue.answer[i]) {
          isCorrect = false
          break
        }
      }
      if (isCorrect) correctAnswers++
      totalAnswers++
    })

    const newScore = Math.round((correctAnswers / totalAnswers) * 100)
    setScore(newScore)

    if (correctAnswers === totalAnswers) {
      setGameCompleted(true)
      // Track progress
      cognitiveAPI.trackProgress({
        date: new Date().toISOString(),
        score: newScore,
        gameType: "crossword",
        difficulty,
        timeSpent: timeElapsed,
        cognitiveAreas: ["Language", "Memory", "Problem Solving"],
      })
    }
  }

  const resetGame = () => {
    setUserAnswers({})
    setScore(0)
    setTimeElapsed(0)
    setGameStarted(false)
    setGameCompleted(false)
    setSelectedClue(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
            <h1 className="text-3xl font-bold text-gray-900">Crossword Puzzle</h1>
            <p className="text-gray-600">Challenge your vocabulary and general knowledge</p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Configure your crossword puzzle</CardDescription>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Theme</label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Knowledge</SelectItem>
                    <SelectItem value="animals">Animals</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={startGame} className="w-full" size="lg" disabled={loading}>
                {loading ? "Generating Puzzle..." : "Start Game"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!puzzle) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button asChild variant="ghost" className="mb-2">
              <Link href="/games/word-puzzles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Word Puzzles
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Crossword Puzzle</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">Time: {formatTime(timeElapsed)}</Badge>
            <Badge variant="outline">Score: {score}%</Badge>
            <Badge>Difficulty: {difficulty}/3</Badge>
          </div>
        </div>

        {gameCompleted && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Congratulations!</h3>
                  <p className="text-green-700">
                    You completed the crossword in {formatTime(timeElapsed)} with a score of {score}%!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Crossword Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Crossword Grid</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={checkAnswers} size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Check Answers
                  </Button>
                  <Button onClick={resetGame} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-1 max-w-lg mx-auto">
                  {puzzle.grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const key = `${rowIndex}-${colIndex}`
                      const isBlack = cell === ""
                      return (
                        <div key={key} className="relative">
                          {isBlack ? (
                            <div className="w-8 h-8 bg-gray-800" />
                          ) : (
                            <Input
                              className="w-8 h-8 text-center text-sm font-bold p-0 border-2 border-gray-300"
                              maxLength={1}
                              value={userAnswers[key] || ""}
                              onChange={(e) => handleCellInput(rowIndex, colIndex, e.target.value)}
                            />
                          )}
                        </div>
                      )
                    }),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clues */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Across</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {puzzle.clues.across.map((clue) => (
                    <div
                      key={`across-${clue.number}`}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedClue === `across-${clue.number}` ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedClue(`across-${clue.number}`)}
                    >
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs">
                          {clue.number}
                        </Badge>
                        <p className="text-sm">{clue.clue}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">({clue.answer.length} letters)</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Down</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {puzzle.clues.down.map((clue) => (
                    <div
                      key={`down-${clue.number}`}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedClue === `down-${clue.number}` ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedClue(`down-${clue.number}`)}
                    >
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs">
                          {clue.number}
                        </Badge>
                        <p className="text-sm">{clue.clue}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">({clue.answer.length} letters)</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Click on a clue to highlight it</li>
                  <li>• Fill in the easiest words first</li>
                  <li>• Use crossing letters as hints</li>
                  <li>• Check your answers frequently</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
