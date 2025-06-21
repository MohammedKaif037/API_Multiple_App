"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Trophy, Timer, CheckCircle, XCircle, Crown } from "lucide-react"
import Link from "next/link"
import { cognitiveAPI } from "@/lib/cognitive-api"

interface ChessPuzzle {
  id: string
  position: string[][]
  description: string
  solution: string
  difficulty: number
  theme: string
  moves: string[]
}

export default function ChessPuzzlesGame() {
  const [currentPuzzle, setCurrentPuzzle] = useState<ChessPuzzle | null>(null)
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [userMoves, setUserMoves] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds] = useState(8)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [difficulty, setDifficulty] = useState(2)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const chessPuzzles: ChessPuzzle[] = [
    {
      id: "1",
      position: [
        ["r", "n", "b", "q", "k", "b", "n", "r"],
        ["p", "p", "p", "p", "", "p", "p", "p"],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "p", "", "", ""],
        ["", "", "", "", "P", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["P", "P", "P", "P", "", "P", "P", "P"],
        ["R", "N", "B", "Q", "K", "B", "N", "R"],
      ],
      description: "White to move. Find the best opening move.",
      solution: "Nf3",
      difficulty: 1,
      theme: "Opening",
      moves: ["Nf3"],
    },
    {
      id: "2",
      position: [
        ["r", "", "", "", "k", "", "", "r"],
        ["p", "p", "p", "", "", "p", "p", "p"],
        ["", "", "n", "", "", "", "", ""],
        ["", "", "", "p", "p", "", "", ""],
        ["", "", "", "P", "P", "", "", ""],
        ["", "", "N", "", "", "", "", ""],
        ["P", "P", "P", "", "", "P", "P", "P"],
        ["R", "", "", "", "K", "", "", "R"],
      ],
      description: "White to move. Checkmate in 2 moves.",
      solution: "Qh5+",
      difficulty: 3,
      theme: "Checkmate",
      moves: ["Qh5+", "Qxf7#"],
    },
  ]

  const pieceSymbols: Record<string, string> = {
    K: "♔",
    Q: "♕",
    R: "♖",
    B: "♗",
    N: "♘",
    P: "♙",
    k: "♚",
    q: "♛",
    r: "♜",
    b: "♝",
    n: "♞",
    p: "♟",
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

  const startGame = () => {
    setGameStarted(true)
    setCurrentRound(1)
    setScore(0)
    setTimeElapsed(0)
    setGameCompleted(false)
    generateNextPuzzle()
  }

  const generateNextPuzzle = () => {
    const filteredPuzzles = chessPuzzles.filter((p) => p.difficulty <= difficulty)
    const randomPuzzle = filteredPuzzles[Math.floor(Math.random() * filteredPuzzles.length)]
    setCurrentPuzzle(randomPuzzle)
    setUserMoves([])
    setSelectedSquare(null)
    setShowResult(false)
  }

  const handleSquareClick = (row: number, col: number) => {
    if (showResult) return

    const square = String.fromCharCode(97 + col) + (8 - row)

    if (selectedSquare) {
      // Make a move
      const move = selectedSquare + square
      setUserMoves((prev) => [...prev, move])
      setSelectedSquare(null)

      // Check if move is correct (simplified)
      if (currentPuzzle && move.includes(currentPuzzle.solution.toLowerCase())) {
        setIsCorrect(true)
        setScore((prev) => prev + 1)
      } else {
        setIsCorrect(false)
      }
      setShowResult(true)

      setTimeout(() => {
        if (currentRound >= totalRounds) {
          setGameCompleted(true)
          const finalScore = Math.round((score / totalRounds) * 100)

          // Track progress
          cognitiveAPI.trackProgress({
            date: new Date().toISOString(),
            score: finalScore,
            gameType: "chess-puzzles",
            difficulty,
            timeSpent: timeElapsed,
            cognitiveAreas: ["Strategic Thinking", "Planning", "Problem Solving"],
          })
        } else {
          setCurrentRound((prev) => prev + 1)
          generateNextPuzzle()
        }
      }, 3000)
    } else {
      // Select a square
      setSelectedSquare(square)
    }
  }

  const resetGame = () => {
    setGameStarted(false)
    setCurrentPuzzle(null)
    setUserMoves([])
    setSelectedSquare(null)
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

  const getSquareColor = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0
    const square = String.fromCharCode(97 + col) + (8 - row)
    const isSelected = selectedSquare === square

    if (isSelected) {
      return "bg-yellow-300"
    }
    return isLight ? "bg-amber-100" : "bg-amber-800"
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/games/board-games">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Board Games
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Chess Puzzles</h1>
            <p className="text-gray-600">Solve tactical chess positions and improve your strategic thinking</p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Configure your chess puzzle challenge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select value={difficulty.toString()} onValueChange={(value) => setDifficulty(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Easy (Basic tactics)</SelectItem>
                    <SelectItem value="2">Medium (Intermediate tactics)</SelectItem>
                    <SelectItem value="3">Hard (Advanced tactics)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-600">
                <p>• Solve {totalRounds} chess puzzles</p>
                <p>• Find the best moves in tactical positions</p>
                <p>• Improve your strategic thinking</p>
              </div>

              <Button onClick={startGame} className="w-full" size="lg">
                Start Puzzles
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
              <Link href="/games/board-games">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Board Games
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Chess Puzzles - Complete!</h1>
          </div>

          <Card className="max-w-md mx-auto bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-2">Well Played!</h3>
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
                    <Link href="/games/board-games">Back to Games</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!currentPuzzle) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button asChild variant="ghost" className="mb-2">
              <Link href="/games/board-games">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Board Games
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Chess Puzzles</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {formatTime(timeElapsed)}
            </Badge>
            <Badge variant="outline">
              Puzzle: {currentRound}/{totalRounds}
            </Badge>
            <Badge variant="outline">
              Score: {score}/{totalRounds}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chess Board */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-6 w-6" />
                  Chess Position
                </CardTitle>
                <CardDescription>{currentPuzzle.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-0 max-w-lg mx-auto border-2 border-gray-800">
                  {currentPuzzle.position.map((row, rowIndex) =>
                    row.map((piece, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          aspect-square flex items-center justify-center text-4xl cursor-pointer
                          ${getSquareColor(rowIndex, colIndex)}
                          hover:opacity-80 transition-opacity
                        `}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                      >
                        {piece && pieceSymbols[piece]}
                      </div>
                    )),
                  )}
                </div>

                {/* Coordinate Labels */}
                <div className="max-w-lg mx-auto mt-2">
                  <div className="grid grid-cols-8 gap-0 text-center text-sm text-gray-600">
                    {["a", "b", "c", "d", "e", "f", "g", "h"].map((letter) => (
                      <div key={letter}>{letter}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Puzzle Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Puzzle Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Theme:</span>
                    <Badge variant="outline" className="ml-2">
                      {currentPuzzle.theme}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Difficulty:</span>
                    <Badge variant="outline" className="ml-2">
                      Level {currentPuzzle.difficulty}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{currentPuzzle.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Moves</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userMoves.length === 0 ? (
                    <p className="text-sm text-gray-500">No moves yet</p>
                  ) : (
                    userMoves.map((move, index) => (
                      <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                        {index + 1}. {move}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Result Feedback */}
            {showResult && (
              <Card className={isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-semibold ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                      {isCorrect ? "Excellent!" : "Not quite"}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="mb-1">
                      <strong>Solution:</strong> {currentPuzzle.solution}
                    </p>
                    <p className="text-gray-600">The best move sequence: {currentPuzzle.moves.join(", ")}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Click a piece to select it</li>
                  <li>• Click destination square to move</li>
                  <li>• Find the best tactical move</li>
                  <li>• Think about checks, captures, threats</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
