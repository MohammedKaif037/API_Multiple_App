"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, RotateCcw, Trophy, User, Bot } from "lucide-react"
import Link from "next/link"

type Player = "X" | "O" | null
type GameMode = "easy" | "medium" | "hard"

export default function TicTacToeGame() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X")
  const [winner, setWinner] = useState<Player | "tie" | null>(null)
  const [gameMode, setGameMode] = useState<GameMode>("medium")
  const [gameStarted, setGameStarted] = useState(false)
  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [gamesPlayed, setGamesPlayed] = useState(0)
  const [isAiTurn, setIsAiTurn] = useState(false)

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ]

  useEffect(() => {
    checkWinner()
  }, [board])

  useEffect(() => {
    if (currentPlayer === "O" && !winner && gameStarted) {
      setIsAiTurn(true)
      const timer = setTimeout(() => {
        makeAiMove()
        setIsAiTurn(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, winner, gameStarted])

  const checkWinner = () => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a])
        if (board[a] === "X") {
          setPlayerScore((prev) => prev + 1)
        } else {
          setAiScore((prev) => prev + 1)
        }
        setGamesPlayed((prev) => prev + 1)
        return
      }
    }

    if (board.every((cell) => cell !== null)) {
      setWinner("tie")
      setGamesPlayed((prev) => prev + 1)
    }
  }

  const makeMove = (index: number) => {
    if (board[index] || winner || currentPlayer !== "X" || isAiTurn) return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)
    setCurrentPlayer("O")
  }

  const makeAiMove = () => {
    const availableMoves = board
      .map((cell, index) => (cell === null ? index : null))
      .filter((val) => val !== null) as number[]

    if (availableMoves.length === 0) return

    let move: number

    switch (gameMode) {
      case "easy":
        // Random move
        move = availableMoves[Math.floor(Math.random() * availableMoves.length)]
        break
      case "medium":
        // Try to win, block player, or random
        move = getBestMove(availableMoves, false) || availableMoves[Math.floor(Math.random() * availableMoves.length)]
        break
      case "hard":
        // Minimax algorithm for optimal play
        move = getBestMove(availableMoves, true) || availableMoves[0]
        break
      default:
        move = availableMoves[0]
    }

    const newBoard = [...board]
    newBoard[move] = "O"
    setBoard(newBoard)
    setCurrentPlayer("X")
  }

  const getBestMove = (availableMoves: number[], useOptimal: boolean): number | null => {
    // Check if AI can win
    for (const move of availableMoves) {
      const testBoard = [...board]
      testBoard[move] = "O"
      if (checkWinnerForBoard(testBoard) === "O") {
        return move
      }
    }

    // Check if AI needs to block player
    for (const move of availableMoves) {
      const testBoard = [...board]
      testBoard[move] = "X"
      if (checkWinnerForBoard(testBoard) === "X") {
        return move
      }
    }

    if (useOptimal) {
      // Take center if available
      if (availableMoves.includes(4)) return 4

      // Take corners
      const corners = [0, 2, 6, 8].filter((corner) => availableMoves.includes(corner))
      if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)]
      }
    }

    return null
  }

  const checkWinnerForBoard = (testBoard: Player[]): Player | null => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination
      if (testBoard[a] && testBoard[a] === testBoard[b] && testBoard[a] === testBoard[c]) {
        return testBoard[a]
      }
    }
    return null
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer("X")
    setWinner(null)
    setIsAiTurn(false)
  }

  const startNewGame = () => {
    setGameStarted(true)
    resetGame()
  }

  const resetStats = () => {
    setPlayerScore(0)
    setAiScore(0)
    setGamesPlayed(0)
    resetGame()
  }

  const getWinRate = () => {
    if (gamesPlayed === 0) return 0
    return Math.round((playerScore / gamesPlayed) * 100)
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
            <h1 className="text-3xl font-bold text-gray-900">Tic-Tac-Toe</h1>
            <p className="text-gray-600">Classic strategy game against AI opponent</p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Choose your difficulty level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">AI Difficulty</label>
                <Select value={gameMode} onValueChange={(value: GameMode) => setGameMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy - Random moves</SelectItem>
                    <SelectItem value="medium">Medium - Smart moves</SelectItem>
                    <SelectItem value="hard">Hard - Optimal play</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>• You play as X (first move)</p>
                <p>• AI plays as O</p>
                <p>• Get three in a row to win</p>
              </div>

              <Button onClick={startNewGame} className="w-full" size="lg">
                Start Game
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button asChild variant="ghost" className="mb-2">
              <Link href="/games/board-games">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Board Games
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Tic-Tac-Toe</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">Difficulty: {gameMode}</Badge>
            <Badge variant="outline">Games: {gamesPlayed}</Badge>
            <Badge variant="outline">Win Rate: {getWinRate()}%</Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Game Board</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={resetGame} variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      New Game
                    </Button>
                    <Button onClick={resetStats} variant="outline" size="sm">
                      Reset Stats
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {winner
                    ? winner === "tie"
                      ? "It's a tie!"
                      : winner === "X"
                        ? "You win! 🎉"
                        : "AI wins! 🤖"
                    : isAiTurn
                      ? "AI is thinking..."
                      : currentPlayer === "X"
                        ? "Your turn (X)"
                        : "AI's turn (O)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                  {board.map((cell, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`aspect-square text-4xl font-bold h-20 w-20 ${
                        cell === "X"
                          ? "text-blue-600 bg-blue-50"
                          : cell === "O"
                            ? "text-red-600 bg-red-50"
                            : "hover:bg-gray-50"
                      }`}
                      onClick={() => makeMove(index)}
                      disabled={!!cell || !!winner || currentPlayer !== "X" || isAiTurn}
                    >
                      {cell}
                    </Button>
                  ))}
                </div>

                {winner && (
                  <div className="mt-6 text-center">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                        winner === "X"
                          ? "bg-green-100 text-green-800"
                          : winner === "O"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {winner === "X" && <Trophy className="h-5 w-5" />}
                      <span className="font-semibold">
                        {winner === "tie" ? "It's a tie!" : winner === "X" ? "You won!" : "AI won!"}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Game Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>You (X)</span>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {playerScore}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-red-600" />
                      <span>AI (O)</span>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {aiScore}
                    </Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Total Games:</span>
                      <span>{gamesPlayed}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Win Rate:</span>
                    <span className="font-medium">{getWinRate()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getWinRate()}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {gamesPlayed > 0
                      ? playerScore > aiScore
                        ? "You're winning!"
                        : playerScore < aiScore
                          ? "AI is ahead"
                          : "It's tied!"
                      : "Play some games to see stats"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Strategy Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Take the center square when possible</li>
                  <li>• Control corners for better positioning</li>
                  <li>• Block opponent's winning moves</li>
                  <li>• Look for fork opportunities</li>
                  <li>• Think two moves ahead</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
