"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Check, RotateCcw, Lightbulb, Trophy, Eye, EyeOff } from "lucide-react"

export default function InteractiveCrossword() {
  const [puzzle, setPuzzle] = useState(null)
  const [userAnswers, setUserAnswers] = useState({})
  const [selectedClue, setSelectedClue] = useState(null)
  const [selectedCell, setSelectedCell] = useState(null)
  const [direction, setDirection] = useState('across')
  const [difficulty, setDifficulty] = useState(2)
  const [theme, setTheme] = useState("general")
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)
  const [currentWord, setCurrentWord] = useState(null)
  const inputRefs = useRef({})

  // Enhanced crossword data with proper grid layout
  const crosswordData = {
    id: "crossword_1",
    grid: [
      ["", "1", "G", "E", "N", "E", "R", "A", "L", ""],
      ["", "", "", "2", "", "", "", "", "3", ""],
      ["", "", "", "G", "", "", "", "", "V", ""],
      ["", "", "", "G", "", "", "", "", "E", ""],
      ["4", "C", "O", "M", "M", "O", "N", "", "R", ""],
      ["", "", "", "", "", "", "", "", "A", ""],
      ["5", "B", "R", "O", "A", "D", "", "", "L", ""],
      ["", "", "", "", "", "", "", "", "L", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
    ],
    clues: {
      across: [
        { number: 1, clue: "Opposite of specific (7 letters)", answer: "GENERAL", startRow: 0, startCol: 1 },
        { number: 4, clue: "Commonplace (6 letters)", answer: "COMMON", startRow: 4, startCol: 1 },
        { number: 5, clue: "Wide in scope (5 letters)", answer: "BROAD", startRow: 6, startCol: 1 },
      ],
      down: [
        { number: 2, clue: "Breakfast food from chickens (3 letters)", answer: "EGG", startRow: 1, startCol: 3 },
        { number: 3, clue: "All-encompassing (7 letters)", answer: "OVERALL", startRow: 1, startCol: 8 },
      ],
    },
    difficulty: 2,
    theme: "general",
  }

  useEffect(() => {
    setPuzzle(crosswordData)
  }, [])

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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPuzzle(crosswordData)
      setGameStarted(true)
      setTimeElapsed(0)
      setScore(0)
      setUserAnswers({})
      setGameCompleted(false)
      setSelectedCell(null)
      setSelectedClue(null)
    } catch (error) {
      setPuzzle(crosswordData)
      setGameStarted(true)
    } finally {
      setLoading(false)
    }
  }

  const getCellKey = (row, col) => `${row}-${col}`

  const isCellInWord = (row, col, clue, clueDirection) => {
    if (clueDirection === 'across') {
      return row === clue.startRow && col >= clue.startCol && col < clue.startCol + clue.answer.length
    } else {
      return col === clue.startCol && row >= clue.startRow && row < clue.startRow + clue.answer.length
    }
  }

  const getWordCells = (clue, clueDirection) => {
    const cells = []
    if (clueDirection === 'across') {
      for (let i = 0; i < clue.answer.length; i++) {
        cells.push({ row: clue.startRow, col: clue.startCol + i })
      }
    } else {
      for (let i = 0; i < clue.answer.length; i++) {
        cells.push({ row: clue.startRow + i, col: clue.startCol })
      }
    }
    return cells
  }

  const handleCellClick = (row, col) => {
    if (!puzzle || puzzle.grid[row][col] === "") return

    setSelectedCell({ row, col })
    
    // Find which clue this cell belongs to
    const acrossClue = puzzle.clues.across.find(clue => 
      isCellInWord(row, col, clue, 'across')
    )
    const downClue = puzzle.clues.down.find(clue => 
      isCellInWord(row, col, clue, 'down')
    )

    // If cell belongs to both across and down, toggle direction
    if (acrossClue && downClue) {
      if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
        setDirection(direction === 'across' ? 'down' : 'across')
        setSelectedClue(direction === 'across' ? `down-${downClue.number}` : `across-${acrossClue.number}`)
        setCurrentWord(direction === 'across' ? downClue : acrossClue)
      } else {
        setDirection('across')
        setSelectedClue(`across-${acrossClue.number}`)
        setCurrentWord(acrossClue)
      }
    } else if (acrossClue) {
      setDirection('across')
      setSelectedClue(`across-${acrossClue.number}`)
      setCurrentWord(acrossClue)
    } else if (downClue) {
      setDirection('down')
      setSelectedClue(`down-${downClue.number}`)
      setCurrentWord(downClue)
    }

    // Focus the input
    setTimeout(() => {
      const inputElement = inputRefs.current[getCellKey(row, col)]
      if (inputElement) {
        inputElement.focus()
      }
    }, 0)
  }

  const handleCellInput = (row, col, value) => {
    if (!value.match(/[A-Za-z]/)) return

    const key = getCellKey(row, col)
    const upperValue = value.toUpperCase()
    
    setUserAnswers(prev => ({
      ...prev,
      [key]: upperValue
    }))

    // Move to next cell in current word
    if (currentWord && value) {
      const wordCells = getWordCells(currentWord, direction)
      const currentIndex = wordCells.findIndex(cell => cell.row === row && cell.col === col)
      
      if (currentIndex >= 0 && currentIndex < wordCells.length - 1) {
        const nextCell = wordCells[currentIndex + 1]
        setSelectedCell(nextCell)
        setTimeout(() => {
          const nextInput = inputRefs.current[getCellKey(nextCell.row, nextCell.col)]
          if (nextInput) {
            nextInput.focus()
          }
        }, 0)
      }
    }
  }

  const handleKeyDown = (e, row, col) => {
    if (e.key === 'Backspace' && !userAnswers[getCellKey(row, col)]) {
      // Move to previous cell if current is empty
      if (currentWord) {
        const wordCells = getWordCells(currentWord, direction)
        const currentIndex = wordCells.findIndex(cell => cell.row === row && cell.col === col)
        
        if (currentIndex > 0) {
          const prevCell = wordCells[currentIndex - 1]
          setSelectedCell(prevCell)
          setTimeout(() => {
            const prevInput = inputRefs.current[getCellKey(prevCell.row, prevCell.col)]
            if (prevInput) {
              prevInput.focus()
            }
          }, 0)
        }
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      let newRow = row, newCol = col
      
      if (e.key === 'ArrowLeft') newCol = Math.max(0, col - 1)
      if (e.key === 'ArrowRight') newCol = Math.min(9, col + 1)
      if (e.key === 'ArrowUp') newRow = Math.max(0, row - 1)
      if (e.key === 'ArrowDown') newRow = Math.min(9, row + 1)
      
      if (puzzle.grid[newRow][newCol] !== "") {
        handleCellClick(newRow, newCol)
      }
    }
  }

  const handleClueClick = (clue, clueDirection) => {
    setSelectedClue(`${clueDirection}-${clue.number}`)
    setCurrentWord(clue)
    setDirection(clueDirection)
    setSelectedCell({ row: clue.startRow, col: clue.startCol })
    
    setTimeout(() => {
      const inputElement = inputRefs.current[getCellKey(clue.startRow, clue.startCol)]
      if (inputElement) {
        inputElement.focus()
      }
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
        const key = getCellKey(clue.startRow, clue.startCol + i)
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
        const key = getCellKey(clue.startRow + i, clue.startCol)
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
    }
  }

  const resetGame = () => {
    setUserAnswers({})
    setScore(0)
    setTimeElapsed(0)
    setGameStarted(false)
    setGameCompleted(false)
    setSelectedClue(null)
    setSelectedCell(null)
    setCurrentWord(null)
    setShowAnswers(false)
  }

  const toggleAnswers = () => {
    setShowAnswers(!showAnswers)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getCellClass = (row, col) => {
    const baseClass = "w-8 h-8 text-center text-sm font-bold border-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    let classes = [baseClass]

    const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col
    const isInCurrentWord = currentWord && isCellInWord(row, col, currentWord, direction)
    
    if (isSelected) {
      classes.push("bg-blue-200 border-blue-500")
    } else if (isInCurrentWord) {
      classes.push("bg-blue-100 border-blue-300")
    } else {
      classes.push("border-gray-300 hover:border-gray-400")
    }

    return classes.join(" ")
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Crossword Puzzle</h1>
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
            <h1 className="text-2xl font-bold text-gray-900">Interactive Crossword Puzzle</h1>
            <p className="text-sm text-gray-600">Click on cells to select words, type to fill them in</p>
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
                  <Button onClick={toggleAnswers} variant="outline" size="sm">
                    {showAnswers ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showAnswers ? "Hide" : "Show"} Answers
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
                      const key = getCellKey(rowIndex, colIndex)
                      const isBlack = cell === ""
                      const isNumberCell = /^\d+$/.test(cell)
                      const cellNumber = isNumberCell ? cell : ""

                      return (
                        <div key={key} className="relative">
                          {isBlack ? (
                            <div className="w-8 h-8 bg-gray-800" />
                          ) : (
                            <div className="relative">
                              <input
                                ref={(el) => inputRefs.current[key] = el}
                                className={getCellClass(rowIndex, colIndex)}
                                maxLength={1}
                                value={showAnswers ? 
                                  (isNumberCell ? "" : puzzle.grid[rowIndex][colIndex]) : 
                                  (userAnswers[key] || "")
                                }
                                onChange={(e) => !showAnswers && handleCellInput(rowIndex, colIndex, e.target.value)}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                                readOnly={showAnswers}
                              />
                              {cellNumber && (
                                <span className="absolute top-0 left-0 text-xs font-bold text-blue-600 bg-white px-1 leading-none pointer-events-none">
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
                      onClick={() => handleClueClick(clue, 'across')}
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
                      onClick={() => handleClueClick(clue, 'down')}
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
                  How to Play
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Click on any cell to start filling a word</li>
                  <li>• Click on clues to jump to that word</li>
                  <li>• Use arrow keys to navigate between cells</li>
                  <li>• Type letters to fill in your answers</li>
                  <li>• Backspace moves to previous cell when empty</li>
                  <li>• Selected word is highlighted in blue</li>
                  <li>• Check answers to see your progress</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
