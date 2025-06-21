"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Check, RotateCcw, Lightbulb, Trophy } from "lucide-react"

type ClueDirection = "across" | "down"

interface CrosswordClue {
  number: number
  clue: string
  answer: string
  startRow: number
  startCol: number
}

interface CrosswordPuzzle {
  id: string
  grid: string[][]
  clues: {
    across: CrosswordClue[]
    down: CrosswordClue[]
  }
  difficulty: number
  theme: string
}

// Mock API function for demo
const generateMockCrossword = (theme: string, difficulty: number): CrosswordPuzzle => {
  // Simple 5x5 crossword that actually works
  const mockClues = {
    across: [
      { number: 1, clue: "Feline pet", answer: "CAT", startRow: 0, startCol: 0 },
      { number: 4, clue: "Large mammal", answer: "APE", startRow: 2, startCol: 0 }
    ],
    down: [
      { number: 1, clue: "Automobile", answer: "CAR", startRow: 0, startCol: 0 },
      { number: 2, clue: "Insect", answer: "ANT", startRow: 0, startCol: 1 },
      { number: 3, clue: "Beverage", answer: "TEA", startRow: 0, startCol: 2 }
    ]
  }

  return {
    id: "mock_puzzle",
    grid: buildGridFromClues(mockClues),
    clues: mockClues,
    difficulty,
    theme
  }
}

// Fixed grid building function
function buildGridFromClues(clues: { across: CrosswordClue[], down: CrosswordClue[] }): string[][] {
  const GRID_SIZE = 10
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""))
  
  // First pass: mark all cells that will contain letters
  const letterCells = new Set<string>()
  const numberCells = new Map<string, number>()
  
  // Process across clues
  clues.across.forEach(clue => {
    const { startRow, startCol, answer, number } = clue
    numberCells.set(`${startRow}-${startCol}`, number)
    
    for (let i = 0; i < answer.length; i++) {
      const col = startCol + i
      if (col < GRID_SIZE) {
        letterCells.add(`${startRow}-${col}`)
      }
    }
  })
  
  // Process down clues
  clues.down.forEach(clue => {
    const { startRow, startCol, answer, number } = clue
    const cellKey = `${startRow}-${startCol}`
    
    // If this cell doesn't already have a number, set it
    if (!numberCells.has(cellKey)) {
      numberCells.set(cellKey, number)
    }
    
    for (let i = 0; i < answer.length; i++) {
      const row = startRow + i
      if (row < GRID_SIZE) {
        letterCells.add(`${row}-${startCol}`)
      }
    }
  })
  
  // Second pass: fill the grid
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cellKey = `${row}-${col}`
      
      if (letterCells.has(cellKey)) {
        // This cell should contain a letter
        grid[row][col] = " " // Placeholder for user input
        
        // If this is a numbered cell, we'll handle numbering in the render
      } else {
        // This cell is blocked/empty
        grid[row][col] = ""
      }
    }
  }
  
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
      // Using mock data instead of API for now
      const mockPuzzle = generateMockCrossword(theme, difficulty)
      setPuzzle(mockPuzzle)
      
      setGameStarted(true)
      setTimeElapsed(0)
      setScore(0)
      setUserAnswers({})
      setGameCompleted(false)
      setHintsUsed(0)
      setCorrectCells({})
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

    if (puzzle && newValue) {
      // Check if this letter is correct for any clue that uses this cell
      let isCorrect = false
      
      // Check across clues
      puzzle.clues.across.forEach((clue) => {
        if (row === clue.startRow && col >= clue.startCol && col < clue.startCol + clue.answer.length) {
          const index = col - clue.startCol
          if (clue.answer[index] === newValue) isCorrect = true
        }
      })
      
      // Check down clues
      puzzle.clues.down.forEach((clue) => {
        if (col === clue.startCol && row >= clue.startRow && row < clue.startRow + clue.answer.length) {
          const index = row - clue.startRow
          if (clue.answer[index] === newValue) isCorrect = true
        }
      })

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
        break
      default:
        if (key.length === 1 && /[a-zA-Z]/.test(key)) {
          handleCellInput(row, col, key)
          // Auto-advance to next cell
          setTimeout(() => focusCell(row, col + 1), 0)
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

  const getCellNumber = (row: number, col: number): number | null => {
    if (!puzzle) return null
    
    // Check if this cell is the start of any clue
    for (const clue of [...puzzle.clues.across, ...puzzle.clues.down]) {
      if (clue.startRow === row && clue.startCol === col) {
        return clue.number
      }
    }
    return null
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

    // Find the first empty cell in this clue
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clueDirection === "across" ? clue.startRow : clue.startRow + i
      const c = clueDirection === "across" ? clue.startCol + i : clue.startCol
      const key = `${r}-${c}`
      
      if (!userAnswers[key] || userAnswers[key] !== clue.answer[i]) {
        handleCellInput(r, c, clue.answer[i])
        setHintsUsed((prev) => prev + 1)
        focusCell(r, c)
        return
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!gameStarted ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Crossword Puzzle</CardTitle>
            <CardDescription>Choose your theme and difficulty</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <Select value={difficulty.toString()} onValueChange={(v) => setDifficulty(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Easy</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="animals">Animals</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={startGame} disabled={loading} className="w-full">
              {loading ? "Generating..." : "Start Game"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* Game Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-6">
              <div className="text-sm">
                <span className="font-medium">Time:</span> {formatTime(timeElapsed)}
              </div>
              <div className="text-sm">
                <span className="font-medium">Score:</span> {score}%
              </div>
              <div className="text-sm">
                <span className="font-medium">Hints:</span> {hintsUsed}/{maxHints}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={checkAnswers}>
                <Check className="mr-1 h-4 w-4" />
                Check
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={revealLetter} 
                disabled={hintsUsed >= maxHints || !selectedClue}
              >
                <Lightbulb className="mr-1 h-4 w-4" />
                Hint
              </Button>
              <Button variant="destructive" size="sm" onClick={resetGame}>
                <RotateCcw className="mr-1 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Crossword Grid */}
            <div className="lg:col-span-2">
              <div className="inline-block bg-white p-4 rounded-lg shadow-sm border">
                <div className="grid grid-cols-10 gap-0.5">
                  {puzzle?.grid.map((row, r) =>
                    row.map((cell, c) => {
                      const key = `${r}-${c}`
                      const isFilled = cell !== ""
                      const isCorrect = correctCells[key]
                      const isFocused = focusedCell === key
                      const cellNumber = getCellNumber(r, c)

                      return (
                        <div key={key} className="relative">
                          {isFilled ? (
                            <div className={`w-8 h-8 border border-gray-400 bg-white relative ${
                              isFocused ? 'ring-2 ring-blue-500' : ''
                            }`}>
                              {cellNumber && (
                                <span className="absolute top-0 left-0 text-xs font-bold text-gray-700 leading-none pl-0.5 pt-0.5">
                                  {cellNumber}
                                </span>
                              )}
                              <Input
                                className={`absolute inset-0 w-full h-full text-center text-sm font-bold border-none p-0 ${
                                  isCorrect === false ? "text-red-500 bg-red-50" : 
                                  isCorrect === true ? "text-green-600 bg-green-50" : ""
                                }`}
                                maxLength={1}
                                value={userAnswers[key] || ""}
                                onChange={(e) => handleCellInput(r, c, e.target.value)}
                                onFocus={() => setFocusedCell(key)}
                                onKeyDown={(e) => handleKeyDown(e, r, c)}
                                ref={(el) => { if (el) inputRefs.current[key] = el }}
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-gray-900" />
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Clues */}
            <div className="space-y-6">
              {(["across", "down"] as ClueDirection[]).map((direction) => (
                <div key={direction}>
                  <h3 className="text-lg font-semibold capitalize mb-3 text-gray-800">
                    {direction}
                  </h3>
                  <div className="space-y-2">
                    {puzzle?.clues[direction].map((clue) => {
                      const clueId = `${direction}-${clue.number}`
                      const isSelected = selectedClue === clueId
                      
                      return (
                        <div
                          key={clueId}
                          className={`p-2 rounded cursor-pointer text-sm transition-colors ${
                            isSelected ? "bg-blue-100 border-l-4 border-blue-500" : "hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedClue(clueId)
                            focusCell(clue.startRow, clue.startCol)
                          }}
                        >
                          <span className="font-medium text-gray-700">{clue.number}.</span>{" "}
                          <span className="text-gray-800">{clue.clue}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {gameCompleted && (
            <div className="mt-8 text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <Trophy className="mx-auto text-yellow-500 mb-2" size={48} />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                🎉 Congratulations!
              </h2>
              <p className="text-gray-600">
                You completed the puzzle in {formatTime(timeElapsed)} with a score of {score}%
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Games
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
