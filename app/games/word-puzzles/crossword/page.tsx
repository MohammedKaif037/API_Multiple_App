import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Check, RotateCcw, Lightbulb, Trophy } from "lucide-react"
import Link from "next/link"

// Mock API for demonstration - replace with your actual API
const mockAPI = {
  generateCrossword: async (theme: string, difficulty: number) => {
    console.log("🎯 Generating crossword with:", { theme, difficulty })
    
    // Simple mock data that actually works
    const mockClues = {
      across: [
        { number: 1, clue: `Study of living organisms`, answer: "BIOLOGY", startRow: 0, startCol: 0 },
        { number: 4, clue: `Chemical element H`, answer: "HYDROGEN", startRow: 2, startCol: 0 },
        { number: 6, clue: `Unit of energy`, answer: "JOULE", startRow: 4, startCol: 2 },
      ],
      down: [
        { number: 2, clue: `Largest planet`, answer: "JUPITER", startRow: 0, startCol: 2 },
        { number: 3, clue: `Speed of light constant`, answer: "C", startRow: 1, startCol: 6 },
        { number: 5, clue: `DNA building block`, answer: "GENE", startRow: 2, startCol: 4 },
      ],
    }

    // Build grid properly
    const grid = Array(10).fill(null).map(() => Array(10).fill(""))
    
    // Place across words
    mockClues.across.forEach(clue => {
      for (let i = 0; i < clue.answer.length; i++) {
        const row = clue.startRow
        const col = clue.startCol + i
        if (row < 10 && col < 10) {
          if (i === 0 && grid[row][col] === "") {
            grid[row][col] = clue.number.toString()
          } else {
            grid[row][col] = clue.answer[i]
          }
        }
      }
    })

    // Place down words
    mockClues.down.forEach(clue => {
      for (let i = 0; i < clue.answer.length; i++) {
        const row = clue.startRow + i
        const col = clue.startCol
        if (row < 10 && col < 10) {
          if (i === 0 && grid[row][col] === "") {
            grid[row][col] = clue.number.toString()
          } else {
            grid[row][col] = clue.answer[i]
          }
        }
      }
    })

    const crossword = {
      id: `crossword_${Date.now()}`,
      grid,
      clues: mockClues,
      difficulty,
      theme,
    }

    console.log("🎮 Generated crossword:", crossword)
    return { success: true, data: crossword }
  }
}

export default function CrosswordGame() {
  const [puzzle, setPuzzle] = useState(null)
  const [userAnswers, setUserAnswers] = useState({})
  const [selectedClue, setSelectedClue] = useState(null)
  const [difficulty, setDifficulty] = useState(1)
  const [theme, setTheme] = useState("science")
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [correctCells, setCorrectCells] = useState({})
  const inputRefs = useRef({})
  const [focusedCell, setFocusedCell] = useState(null)
  const maxHints = 3

  useEffect(() => {
    let interval
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
      const response = await mockAPI.generateCrossword(theme, difficulty)
      if (response.success && response.data) {
        console.log("✅ Setting puzzle:", response.data)
        setPuzzle(response.data)
        setGameStarted(true)
        setTimeElapsed(0)
        setScore(0)
        setUserAnswers({})
        setGameCompleted(false)
        setHintsUsed(0)
        setCorrectCells({})
      }
    } catch (error) {
      console.error("Failed to generate puzzle:", error)
      alert("Error generating puzzle. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCellInput = (row, col, value) => {
    const key = `${row}-${col}`
    const newValue = value.toUpperCase()

    setUserAnswers((prev) => ({
      ...prev,
      [key]: newValue,
    }))

    // Check if the input is correct
    if (puzzle) {
      let isCorrect = false
      for (const direction of ["across", "down"]) {
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

  const handleKeyDown = (e, row, col) => {
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

  const focusCell = (row, col) => {
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

    for (const direction of ["across", "down"]) {
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
    setPuzzle(null)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const revealLetter = () => {
    if (hintsUsed >= maxHints || !selectedClue || !puzzle) return

    const clueDirection = selectedClue.startsWith("across") ? "across" : "down"
    const clueNumber = parseInt(selectedClue.split("-")[1])

    const clue = puzzle.clues[clueDirection].find((c) => c.number === clueNumber)
    if (!clue) return

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

  const isCellFilled = (row, col) => {
    if (!puzzle) return false
    return puzzle.grid[row][col] !== ""
  }

  const getCellNumber = (row, col) => {
    if (!puzzle) return null
    const cell = puzzle.grid[row][col]
    return /^\d+$/.test(cell) ? cell : null
  }

  const getCellLetter = (row, col) => {
    if (!puzzle) return ""
    const cell = puzzle.grid[row][col]
    return /^[A-Z]$/.test(cell) ? cell : ""
  }

  return (
    <div className="p-4">
      {!gameStarted ? (
        <Card className="max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle>Start Crossword</CardTitle>
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
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="animals">Animals</SelectItem>
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
          {/* Game Stats */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-6">
              <div className="text-sm">
                <span className="font-medium">⏱️ Time:</span> {formatTime(timeElapsed)}
              </div>
              <div className="text-sm">
                <span className="font-medium">💯 Score:</span> {score}%
              </div>
              <div className="text-sm">
                <span className="font-medium">💡 Hints:</span> {hintsUsed}/{maxHints}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={checkAnswers} size="sm">
                <Check className="mr-1 h-4 w-4" /> Check
              </Button>
              <Button 
                variant="outline" 
                onClick={revealLetter} 
                disabled={hintsUsed >= maxHints || !selectedClue}
                size="sm"
              >
                <Lightbulb className="mr-1 h-4 w-4" /> Hint
              </Button>
              <Button variant="destructive" onClick={resetGame} size="sm">
                <RotateCcw className="mr-1 h-4 w-4" /> Reset
              </Button>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Crossword Grid */}
            <div className="flex-shrink-0">
              <div className="inline-block border-2 border-gray-800 bg-white">
                <div className="grid grid-cols-10 gap-0">
                  {puzzle?.grid.map((row, r) =>
                    row.map((cell, c) => {
                      const key = `${r}-${c}`
                      const isFilled = isCellFilled(r, c)
                      const cellNumber = getCellNumber(r, c)
                      const isCorrect = correctCells[key]
                      const isFocused = focusedCell === key
                      const userValue = userAnswers[key] || ""

                      return (
                        <div
                          key={key}
                          className={`
                            w-8 h-8 border border-gray-400 relative
                            ${isFilled ? "bg-white" : "bg-black"}
                            ${isFocused ? "ring-2 ring-blue-500" : ""}
                          `}
                        >
                          {isFilled && (
                            <>
                              {/* Number marker */}
                              {cellNumber && (
                                <span className="absolute top-0 left-0 text-xs font-bold text-black leading-none ml-0.5">
                                  {cellNumber}
                                </span>
                              )}
                              
                              {/* Input field */}
                              <input
                                ref={(el) => {
                                  if (el) inputRefs.current[key] = el
                                }}
                                className={`
                                  w-full h-full text-center text-sm font-bold border-none outline-none bg-transparent
                                  ${isCorrect === false ? "text-red-500" : isCorrect === true ? "text-green-600" : "text-black"}
                                `}
                                maxLength={1}
                                value={userValue}
                                onChange={(e) => handleCellInput(r, c, e.target.value)}
                                onFocus={() => setFocusedCell(key)}
                                onKeyDown={(e) => handleKeyDown(e, r, c)}
                                style={{ caretColor: 'transparent' }}
                              />
                            </>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Clues */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {["across", "down"].map((direction) => (
                <div key={direction}>
                  <h3 className="text-lg font-semibold capitalize mb-3 text-gray-800">
                    {direction} Clues
                  </h3>
                  <div className="space-y-2">
                    {puzzle?.clues[direction].map((clue) => {
                      const clueId = `${direction}-${clue.number}`
                      const isSelected = selectedClue === clueId

                      return (
                        <div
                          key={clueId}
                          className={`
                            cursor-pointer p-3 rounded-lg border transition-colors
                            ${isSelected 
                              ? "bg-blue-50 border-blue-300" 
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            }
                          `}
                          onClick={() => {
                            setSelectedClue(clueId)
                            // Focus first cell of the clue
                            const firstRow = direction === "across" ? clue.startRow : clue.startRow
                            const firstCol = direction === "across" ? clue.startCol : clue.startCol
                            focusCell(firstRow, firstCol)
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-blue-600 flex-shrink-0">
                              {clue.number}.
                            </span>
                            <span className="text-sm text-gray-700">
                              {clue.clue}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

           

            {gameCompleted && (
              <div className="mt-6 text-center">
                <Trophy className="mx-auto text-yellow-500" size={40} />
                <h2 className="text-2xl font-bold mt-2">🎉 Congratulations! You completed the puzzle!</h2>
                <p className="text-sm mt-1">Final Score: {score} | Time: {formatTime(timeElapsed)}</p>
              </div>
            )}

            <Link href="/games" className="mt-6 inline-flex items-center text-blue-600 hover:underline text-sm">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Games
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
