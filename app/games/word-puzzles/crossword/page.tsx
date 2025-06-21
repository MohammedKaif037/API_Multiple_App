"use client"

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

// ✅ Helper to generate grid from clues
function buildGridFromClues(clues: CrosswordPuzzle["clues"]): string[][] {
  const grid = Array.from({ length: 10 }, () => Array(10).fill(""))

  const placeWord = (
    answer: string,
    row: number,
    col: number,
    direction: ClueDirection,
    number: number
  ) => {
    for (let i = 0; i < answer.length; i++) {
      const r = direction === "across" ? row : row + i
      const c = direction === "across" ? col + i : col

      if (r >= 10 || c >= 10) continue

      if (i === 0 && grid[r][c] === "") {
        grid[r][c] = number.toString()
      } else if (!/^\d+$/.test(grid[r][c])) {
        grid[r][c] = answer[i]
      }
    }
  }

  clues.across.forEach(clue =>
    placeWord(clue.answer, clue.startRow, clue.startCol, "across", clue.number)
  )

  clues.down.forEach(clue =>
    placeWord(clue.answer, clue.startRow, clue.startCol, "down", clue.number)
  )

  return grid
}

export default function CrosswordGame() {
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [selectedClue, setSelectedClue] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState(1)
  const [theme, setTheme] = useState("animals")
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

  useEffect(() => {
    loadProgress()
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
    if (puzzle) saveProgress()
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
        const grid = buildGridFromClues(response.data.clues)
        setPuzzle({
          ...response.data,
          id: "api_generated_puzzle",
          grid,
        })
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
      console.error("Failed to generate puzzle:", error)
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

    if (puzzle) {
      let isCorrect = false
      for (const direction of ["across", "down"] as ClueDirection[]) {
        puzzle.clues[direction].forEach((clue) => {
          if (direction === "across") {
            if (row === clue.startRow && col >= clue.startCol && col < clue.startCol + clue.answer.length) {
              const index = col - clue.startCol
              if (clue.answer[index] === newValue) isCorrect = true
            }
          } else {
            if (col === clue.startCol && row >= clue.startRow && row < clue.startRow + clue.answer.length) {
              const index = row - clue.startRow
              if (clue.answer[index] === newValue) isCorrect = true
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
        handleCellInput(row, col, "")
        focusCell(row, col - 1)
        break
      default:
        if (key.length === 1 && /[a-zA-Z]/.test(key)) {
          handleCellInput(row, col, key)
          focusCell(row, col + 1)
        }
        break
    }
  }

  const focusCell = (row: number, col: number) => {
    if (!puzzle || row < 0 || col < 0 || row >= 10 || col >= 10 || puzzle.grid[row][col] === "") return

    const key = `${row}-${col}`
    setFocusedCell(key)

    setTimeout(() => {
      inputRefs.current[key]?.focus()
    }, 0)
  }

  const checkAnswers = () => {
    if (!puzzle) return

    let correctAnswers = 0
    let totalAnswers = 0

    for (const direction of ["across", "down"] as ClueDirection[]) {
      puzzle.clues[direction].forEach((clue) => {
        let isCorrect = true
        for (let i = 0; i < clue.answer.length; i++) {
          const row = direction === "across" ? clue.startRow : clue.startRow + i
          const col = direction === "across" ? clue.startCol + i : clue.startCol
          const key = `${row}-${col}`
          if (userAnswers[key] !== clue.answer[i]) {
            isCorrect = false
            break
          }
        }
        if (isCorrect) correctAnswers++
        totalAnswers++
      })
    }

    const newScore = Math.round((correctAnswers / totalAnswers) * 100)
    setScore(newScore)

    if (correctAnswers === totalAnswers) {
      setGameCompleted(true)
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

    for (let i = 0; i < clue.answer.length; i++) {
      const r = clueDirection === "across" ? rowIndex : rowIndex + i
      const c = clueDirection === "across" ? colIndex + i : colIndex
      const key = `${r}-${c}`
      if (!userAnswers[key] || userAnswers[key] !== clue.answer[i]) {
        handleCellInput(r, c, clue.answer[i])
        setHintsUsed((prev) => prev + 1)
        focusCell(r, c)
        return
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

  // ⚡ Render starts here
  return (
    <div>
      {!gameStarted ? (
        <Card className="max-w-md mx-auto mt-10 p-4">
          <CardHeader>
            <CardTitle>Start Crossword</CardTitle>
            <CardDescription>Choose your theme and difficulty</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label>Difficulty</label>
              <Select value={difficulty.toString()} onValueChange={(v) => setDifficulty(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Easy</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label>Theme</label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger><SelectValue placeholder="Select theme" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="animals">Animals</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={startGame} disabled={loading}>
              {loading ? "Generating..." : "Start Game"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-10 text-center">
          {/* You already have rendering code for the puzzle grid and clues in your original component */}
          <p className="text-lg">Puzzle Loaded!</p>
        </div>
      )}
    </div>
  )
}
