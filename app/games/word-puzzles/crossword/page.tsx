"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Check, RotateCcw, Lightbulb, Trophy } from "lucide-react"
import Link from "next/link"
import { cognitiveAPI, type CrosswordPuzzle } from "@/lib/cognitive-api"

type ClueDirection = "across" | "down"

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
  const [hintsUsed, setHintsUsed] = useState(0)
  const maxHints = 3
  const [correctCells, setCorrectCells] = useState<Record<string, boolean>>({})
  const inputRefs = useRef<Record<string, HTMLInputElement>>({})
  const [focusedCell, setFocusedCell] = useState<string | null>(null)

  // Enhanced crossword data with proper grid layout
  const crosswordData: CrosswordPuzzle = {
    id: "crossword_1",
    grid: [
      ["1", "E", "L", "E", "P", "H", "A", "N", "T", ""],
      ["", "", "", "2", "", "", "", "", "3", ""],
      ["", "", "", "G", "", "", "", "", "R", ""],
      ["", "", "", "G", "", "", "", "", "E", ""],
      ["4", "A", "P", "P", "L", "E", "", "", "E", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["5", "B", "E", "E", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
    ],
    clues: {
      across: [
        { number: 1, clue: "Large gray mammal with trunk", answer: "ELEPHANT", startRow: 0, startCol: 1 },
        { number: 4, clue: "Red fruit that grows on trees", answer: "APPLE", startRow: 4, startCol: 1 },
        { number: 5, clue: "Flying insect that makes honey", answer: "BEE", startRow: 6, startCol: 1 },
      ],
      down: [
        { number: 2, clue: "Breakfast food from chickens", answer: "EGG", startRow: 1, startCol: 3 },
        { number: 3, clue: "Tall plant with leaves", answer: "TREE", startRow: 1, startCol: 8 },
      ],
    },
    difficulty: 2,
    theme: "general",
  }

  useEffect(() => {
    loadProgress()
  }, [])

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

  useEffect(() => {
    if (puzzle) {
      saveProgress()
    }
  }, [userAnswers, score, timeElapsed, gameCompleted])

  const loadProgress = () => {
    const savedPuzzle = localStorage.getItem("crosswordPuzzle")
    const savedAnswers = localStorage.getItem("userAnswers")
    const savedScore = localStorage.getItem("score")
    const savedTime = localStorage.getItem("timeElapsed")
    const savedCompleted = localStorage.getItem("gameCompleted")

    if (savedPuzzle && savedAnswers && savedScore && savedTime && savedCompleted) {
      setPuzzle(JSON.parse(savedPuzzle))
      setUserAnswers(JSON.parse(savedAnswers))
      setScore(Number.parseInt(savedScore))
      setTimeElapsed(Number.parseInt(savedTime))
      setGameCompleted(JSON.parse(savedCompleted))
      setGameStarted(true)
    }
  }

  const saveProgress = () => {
    if (puzzle) {
      localStorage.setItem("crosswordPuzzle", JSON.stringify(puzzle))
      localStorage.setItem("userAnswers", JSON.stringify(userAnswers))
      localStorage.setItem("score", JSON.stringify(score))
      localStorage.setItem("timeElapsed", JSON.stringify(timeElapsed))
      localStorage.setItem("gameCompleted", JSON.stringify(gameCompleted))
    }
  }

  const clearProgress = () => {
    localStorage.removeItem("crosswordPuzzle")
    localStorage.removeItem("userAnswers")
    localStorage.removeItem("score")
    localStorage.removeItem("timeElapsed")
    localStorage.removeItem("gameCompleted")
  }

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
      setHintsUsed(0)
      setCorrectCells({})
      clearProgress()
    } catch (error) {
      setPuzzle(crosswordData)
      setGameStarted(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCellInput = (row: number, col: number, value: string) => {
    const key = `${row}-${col}`
    const newValue = value.toUpperCase()

    setUserAnswers((prev) => ({
      ...prev,
      [key]: newValue,
    }))

    // Validate answer in real-time
    if (puzzle) {
      let isCorrect = false
      for (const direction of ["across", "down"] as ClueDirection[]) {
        puzzle.clues[direction].forEach((clue) => {
          if (direction === "across") {
            if (row === clue.startRow && col >= clue.startCol && col < clue.startCol + clue.answer.length) {
              const index = col - clue.startCol
              if (clue.answer[index] === newValue) {
                isCorrect = true
              }
            }
          } else {
            if (col === clue.startCol && row >= clue.startRow && row < clue.startRow + clue.answer.length) {
              const index = row - clue.startRow
              if (clue.answer[index] === newValue) {
                isCorrect = true
              }
            }
          }
        })
      }

      setCorrectCells((prev) => ({
        ...prev,
        [key]: isCorrect,
      }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    const key = e.key
    const gridSize = puzzle?.grid.length || 10 // Default to 10 if puzzle is not yet loaded

    switch (key) {
      case "ArrowLeft":
        e.preventDefault()
        focusCell(row, col - 1)
        break
      case "ArrowRight":
        e.preventDefault()
        focusCell(row, col + 1)
        break
      case "ArrowUp":
        e.preventDefault()
        focusCell(row - 1, col)
        break
      case "ArrowDown":
        e.preventDefault()
        focusCell(row + 1, col)
        break
      case "Backspace":
        // Clear the current cell and move to the previous cell
        handleCellInput(row, col, "") // Clear current cell
        focusCell(row, col - 1) // Move focus to the previous cell
        break
      default:
        if (key.length === 1 && /[a-zA-Z]/.test(key)) {
          // Auto-advance to the next cell after entering a letter
          handleCellInput(row, col, key)
          focusCell(row, col + 1)
        }
        break
    }
  }

  const focusCell = (row: number, col: number) => {
    if (
      !puzzle ||
      row < 0 ||
      row >= puzzle.grid.length ||
      col < 0 ||
      col >= puzzle.grid[0].length ||
      puzzle.grid[row][col] === ""
    ) {
      return
    }
    const newFocusedCell = `${row}-${col}`
    setFocusedCell(newFocusedCell)

    // Use a timeout to ensure the input is rendered before focusing
    setTimeout(() => {
      inputRefs.current[newFocusedCell]?.focus()
    }, 0)
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
    setHintsUsed(0)
    setCorrectCells({})
    clearProgress()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const revealLetter = () => {
    if (hintsUsed >= maxHints || !selectedClue || !puzzle) return

    const clueDirection: ClueDirection = selectedClue.startsWith("across") ? "across" : "down"
    const clueNumber = Number.parseInt(selectedClue.split("-")[1])

    const clue = puzzle.clues[clueDirection].find((c) => c.number === clueNumber)

    if (!clue) return

    let rowIndex = clue.startRow
    let colIndex = clue.startCol
    let letterIndex = 0

    if (clueDirection === "across") {
      while (letterIndex < clue.answer.length) {
        const cellKey = `${rowIndex}-${colIndex}`
        if (!userAnswers[cellKey] || userAnswers[cellKey] !== clue.answer[letterIndex]) {
          handleCellInput(rowIndex, colIndex, clue.answer[letterIndex])
          setHintsUsed((prev) => prev + 1)
          focusCell(rowIndex, colIndex)
          return
        }
        colIndex++
        letterIndex++
      }
    } else {
      while (letterIndex < clue.answer.length) {
        const cellKey = `${rowIndex}-${colIndex}`
        if (!userAnswers[cellKey] || userAnswers[cellKey] !== clue.answer[letterIndex]) {
          handleCellInput(rowIndex, colIndex, clue.answer[letterIndex])
          setHintsUsed((prev) => prev + 1)
          focusCell(rowIndex, colIndex)
          return
        }
        rowIndex++
        letterIndex++
      }
    }
  }

  const getClueCoordinates = (clue: any, direction: ClueDirection) => {
    const coordinates = []
    for (let i = 0; i < clue.answer.length; i++) {
      const row = direction === "across" ? clue.startRow : clue.startRow + i
      const col = direction === "across" ? clue.startCol + i : clue.startCol
      coordinates.push(`${row}-${col}`)
    }
    return coordinates
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
            <Badge variant="secondary">
              Hints: {hintsUsed}/{maxHints}
            </Badge>
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
                  <Button
                    onClick={revealLetter}
                    variant="secondary"
                    size="sm"
                    disabled={hintsUsed >= maxHints || !selectedClue}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Reveal Letter
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
                      const isNumberCell = /^\d+$/.test(cell)
                      const cellNumber = isNumberCell ? cell : ""
                      const isFocused = focusedCell === key
                      const isCorrect = correctCells[key] === true
                      const isIncorrect = correctCells[key] === false

                      let highlighted = false
                      if (selectedClue) {
                        const clueDirection: ClueDirection = selectedClue.startsWith("across") ? "across" : "down"
                        const clueNumber = Number.parseInt(selectedClue.split("-")[1])
                        const clue = puzzle.clues[clueDirection].find((c) => c.number === clueNumber)
                        if (clue) {
                          const clueCoordinates = getClueCoordinates(clue, clueDirection)
                          highlighted = clueCoordinates.includes(key)
                        }
                      }

                      return (
                        <div key={key} className="relative">
                          {isBlack ? (
                            <div className="w-8 h-8 bg-gray-800" />
                          ) : (
                            <div className="relative">
                              <Input
                                className={`w-8 h-8 text-center text-sm font-bold p-0 border-2 ${
                                  isCorrect
                                    ? "border-green-500 bg-green-50"
                                    : isIncorrect
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-300"
                                } ${isFocused ? "ring-2 ring-blue-500" : ""} ${highlighted ? "bg-blue-100" : ""}`}
                                maxLength={1}
                                value={userAnswers[key] || ""}
                                onChange={(e) => handleCellInput(rowIndex, colIndex, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                                ref={(el) => (inputRefs.current[key] = el as HTMLInputElement)}
                                onFocus={() => setFocusedCell(key)}
                              />
                              {cellNumber && (
                                <span className="absolute top-0 left-0 text-xs font-bold text-blue-600 bg-white px-1 leading-none">
                                  {cellNumber}
                                </span>
                              )}
                            </div>
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
                      onClick={() => {
                        setSelectedClue(`across-${clue.number}`)
                        const firstCellKey = `${clue.startRow}-${clue.startCol}`
                        setFocusedCell(firstCellKey)
                        setTimeout(() => {
                          inputRefs.current[firstCellKey]?.focus()
                        }, 0)
                      }}
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
                      onClick={() => {
                        setSelectedClue(`down-${clue.number}`)
                        const firstCellKey = `${clue.startRow}-${clue.startCol}`
                        setFocusedCell(firstCellKey)
                        setTimeout(() => {
                          inputRefs.current[firstCellKey]?.focus()
                        }, 0)
                      }}
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
                  <li>• Use arrow keys to navigate</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
