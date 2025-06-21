"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, RotateCcw, Trophy, Timer, CheckCircle } from "lucide-react"
import Link from "next/link"
import { cognitiveAPI, type WordSearchPuzzle } from "@/lib/cognitive-api"

interface FoundWord {
  word: string
  positions: number[]
}

export default function WordSearchGame() {
  const [puzzle, setPuzzle] = useState<WordSearchPuzzle | null>(null)
  const [foundWords, setFoundWords] = useState<FoundWord[]>([])
  const [selectedCells, setSelectedCells] = useState<number[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [difficulty, setDifficulty] = useState(2)
  const [theme, setTheme] = useState("animals")
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [loading, setLoading] = useState(false)

  // Create a sample word search puzzle
  const createWordSearchPuzzle = (): WordSearchPuzzle => {
    const themes = {
      animals: ["CAT", "DOG", "BIRD", "FISH", "LION", "BEAR"],
      colors: ["RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE"],
      food: ["APPLE", "BREAD", "CHEESE", "PIZZA", "CAKE", "SOUP"],
    }

    const words = themes[theme as keyof typeof themes] || themes.animals
    const gridSize = difficulty === 1 ? 10 : difficulty === 2 ? 12 : 15

    // Create empty grid
    const grid: string[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(""))

    // Place words (simplified placement - horizontal and vertical only)
    const placedWords: string[] = []

    words.slice(0, difficulty + 3).forEach((word) => {
      let placed = false
      let attempts = 0

      while (!placed && attempts < 50) {
        const direction = Math.random() > 0.5 ? "horizontal" : "vertical"
        const row = Math.floor(Math.random() * gridSize)
        const col = Math.floor(Math.random() * gridSize)

        if (direction === "horizontal" && col + word.length <= gridSize) {
          let canPlace = true
          for (let i = 0; i < word.length; i++) {
            if (grid[row][col + i] !== "" && grid[row][col + i] !== word[i]) {
              canPlace = false
              break
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              grid[row][col + i] = word[i]
            }
            placedWords.push(word)
            placed = true
          }
        } else if (direction === "vertical" && row + word.length <= gridSize) {
          let canPlace = true
          for (let i = 0; i < word.length; i++) {
            if (grid[row + i][col] !== "" && grid[row + i][col] !== word[i]) {
              canPlace = false
              break
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              grid[row + i][col] = word[i]
            }
            placedWords.push(word)
            placed = true
          }
        }
        attempts++
      }
    })

    // Fill empty cells with random letters
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col] === "") {
          grid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26))
        }
      }
    }

    return {
      id: `wordsearch_${Date.now()}`,
      grid: grid.map((row) => row.join("")).map((row) => row.split("")),
      words: placedWords,
      theme,
      difficulty,
    }
  }

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
    if (puzzle && foundWords.length === puzzle.words.length) {
      setGameCompleted(true)
      const score = Math.max(100 - Math.floor(timeElapsed / 10), 50) // Score based on time

      // Track progress
      cognitiveAPI.trackProgress({
        date: new Date().toISOString(),
        score,
        gameType: "word-search",
        difficulty,
        timeSpent: timeElapsed,
        cognitiveAreas: ["Visual Processing", "Attention", "Pattern Recognition"],
      })
    }
  }, [foundWords, puzzle, timeElapsed, difficulty])

  const startGame = async () => {
    setLoading(true)
    try {
      const response = await cognitiveAPI.generateWordSearch(theme, difficulty)
      if (response.success && response.data) {
        setPuzzle(response.data)
      } else {
        setPuzzle(createWordSearchPuzzle())
      }
      setGameStarted(true)
      setTimeElapsed(0)
      setFoundWords([])
      setSelectedCells([])
      setGameCompleted(false)
    } catch (error) {
      setPuzzle(createWordSearchPuzzle())
      setGameStarted(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCellMouseDown = (index: number) => {
    setIsSelecting(true)
    setSelectedCells([index])
  }

  const handleCellMouseEnter = (index: number) => {
    if (isSelecting && selectedCells.length > 0) {
      const start = selectedCells[0]
      const gridSize = Math.sqrt(puzzle?.grid.flat().length || 144)
      const startRow = Math.floor(start / gridSize)
      const startCol = start % gridSize
      const endRow = Math.floor(index / gridSize)
      const endCol = index % gridSize

      // Only allow straight lines (horizontal, vertical, diagonal)
      const rowDiff = endRow - startRow
      const colDiff = endCol - startCol

      if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
        const cells = getLineCells(start, index, gridSize)
        setSelectedCells(cells)
      }
    }
  }

  const handleCellMouseUp = () => {
    if (selectedCells.length > 1) {
      checkForWord()
    }
    setIsSelecting(false)
  }

  const getLineCells = (start: number, end: number, gridSize: number): number[] => {
    const cells: number[] = []
    const startRow = Math.floor(start / gridSize)
    const startCol = start % gridSize
    const endRow = Math.floor(end / gridSize)
    const endCol = end % gridSize

    const rowStep = endRow === startRow ? 0 : endRow > startRow ? 1 : -1
    const colStep = endCol === startCol ? 0 : endCol > startCol ? 1 : -1

    let currentRow = startRow
    let currentCol = startCol

    while (true) {
      cells.push(currentRow * gridSize + currentCol)
      if (currentRow === endRow && currentCol === endCol) break
      currentRow += rowStep
      currentCol += colStep
    }

    return cells
  }

  const checkForWord = () => {
    if (!puzzle) return

    const selectedLetters = selectedCells
      .map((index) => {
        const gridSize = Math.sqrt(puzzle.grid.flat().length)
        const row = Math.floor(index / gridSize)
        const col = index % gridSize
        return puzzle.grid[row][col]
      })
      .join("")

    const reversedLetters = selectedLetters.split("").reverse().join("")

    const foundWord = puzzle.words.find((word) => word === selectedLetters || word === reversedLetters)

    if (foundWord && !foundWords.some((fw) => fw.word === foundWord)) {
      setFoundWords((prev) => [...prev, { word: foundWord, positions: selectedCells }])
    }

    setSelectedCells([])
  }

  const resetGame = () => {
    setGameStarted(false)
    setPuzzle(null)
    setFoundWords([])
    setSelectedCells([])
    setTimeElapsed(0)
    setGameCompleted(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const isCellFound = (index: number) => {
    return foundWords.some((fw) => fw.positions.includes(index))
  }

  const isCellSelected = (index: number) => {
    return selectedCells.includes(index)
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
            <h1 className="text-3xl font-bold text-gray-900">Word Search</h1>
            <p className="text-gray-600">Find hidden words in the letter grid</p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Configure your word search puzzle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select value={difficulty.toString()} onValueChange={(value) => setDifficulty(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Easy (10x10 grid)</SelectItem>
                    <SelectItem value="2">Medium (12x12 grid)</SelectItem>
                    <SelectItem value="3">Hard (15x15 grid)</SelectItem>
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
                    <SelectItem value="animals">Animals</SelectItem>
                    <SelectItem value="colors">Colors</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-600">
                <p>• Drag to select words in any direction</p>
                <p>• Words can be horizontal, vertical, or diagonal</p>
                <p>• Find all words as quickly as possible</p>
              </div>

              <Button onClick={startGame} className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating puzzle..." : "Start Game"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!puzzle) return null

  const gridSize = Math.sqrt(puzzle.grid.flat().length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button asChild variant="ghost" className="mb-2">
              <Link href="/games/word-puzzles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Word Puzzles
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Word Search</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {formatTime(timeElapsed)}
            </Badge>
            <Badge variant="outline">
              Found: {foundWords.length}/{puzzle.words.length}
            </Badge>
            <Badge>Theme: {theme}</Badge>
          </div>
        </div>

        {gameCompleted && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Congratulations!</h3>
                  <p className="text-green-700">You found all words in {formatTime(timeElapsed)}!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Word Search Grid */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Word Grid</CardTitle>
                  <Button onClick={resetGame} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    New Game
                  </Button>
                </div>
                <CardDescription>Drag to select words in any direction</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`grid gap-1 max-w-2xl mx-auto select-none`}
                  style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
                  onMouseLeave={() => setIsSelecting(false)}
                >
                  {puzzle.grid.flat().map((letter, index) => (
                    <div
                      key={index}
                      className={`
                        w-8 h-8 flex items-center justify-center text-sm font-bold border cursor-pointer transition-colors
                        ${
                          isCellFound(index)
                            ? "bg-green-200 border-green-400 text-green-800"
                            : isCellSelected(index)
                              ? "bg-blue-200 border-blue-400 text-blue-800"
                              : "bg-white border-gray-300 hover:bg-gray-50"
                        }
                      `}
                      onMouseDown={() => handleCellMouseDown(index)}
                      onMouseEnter={() => handleCellMouseEnter(index)}
                      onMouseUp={handleCellMouseUp}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Word List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Words to Find</CardTitle>
                <CardDescription>
                  {foundWords.length}/{puzzle.words.length} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {puzzle.words.map((word) => {
                    const isFound = foundWords.some((fw) => fw.word === word)
                    return (
                      <div
                        key={word}
                        className={`flex items-center justify-between p-2 rounded ${
                          isFound ? "bg-green-50 text-green-800" : "bg-gray-50"
                        }`}
                      >
                        <span className={isFound ? "line-through" : ""}>{word}</span>
                        {isFound && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Completion:</span>
                    <span>{Math.round((foundWords.length / puzzle.words.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(foundWords.length / puzzle.words.length) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">Time: {formatTime(timeElapsed)}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
