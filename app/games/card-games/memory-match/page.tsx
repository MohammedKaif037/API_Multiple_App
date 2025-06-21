"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, RotateCcw, Trophy, Timer } from "lucide-react"
import Link from "next/link"
import { cognitiveAPI, type MemoryGame } from "@/lib/cognitive-api"

export default function MemoryMatchGame() {
  const [game, setGame] = useState<MemoryGame | null>(null)
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [difficulty, setDifficulty] = useState(2)
  const [theme, setTheme] = useState("animals")
  const [loading, setLoading] = useState(false)

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
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards
      const firstCard = game?.cards.find((card) => card.id === first)
      const secondCard = game?.cards.find((card) => card.id === second)

      if (firstCard && secondCard && firstCard.content === secondCard.content) {
        // Match found
        setMatchedPairs((prev) => [...prev, firstCard.content])
        setFlippedCards([])
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setFlippedCards([])
        }, 1000)
      }
      setMoves((prev) => prev + 1)
    }
  }, [flippedCards, game])

  useEffect(() => {
    if (game && matchedPairs.length === game.cards.length / 2) {
      setGameCompleted(true)
      const score = Math.max(100 - moves * 2, 0) // Score based on efficiency

      // Track progress
      cognitiveAPI.trackProgress({
        date: new Date().toISOString(),
        score,
        gameType: "memory-cards",
        difficulty,
        timeSpent: timeElapsed,
        cognitiveAreas: ["Visual Memory", "Attention", "Processing Speed"],
      })
    }
  }, [matchedPairs, game, moves, timeElapsed, difficulty])

  const startGame = async () => {
    setLoading(true)
    try {
      const response = await cognitiveAPI.generateMemoryGame(theme, difficulty)
      if (response.success && response.data) {
        setGame(response.data)
      } else {
        // Create default game if API fails
        createDefaultGame()
      }
      setGameStarted(true)
      resetGameState()
    } catch (error) {
      createDefaultGame()
      setGameStarted(true)
      resetGameState()
    } finally {
      setLoading(false)
    }
  }

  const createDefaultGame = () => {
    const themes = {
      animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐸", "🐵"],
      fruits: ["🍎", "🍌", "🍊", "🍇", "🍓", "🥝", "🍑", "🍒", "🥭", "🍍"],
      shapes: ["⭐", "🔵", "🔺", "🟢", "🟡", "🟣", "🔶", "🔷", "🟠", "🔴"],
    }

    const cardCount = difficulty === 1 ? 8 : difficulty === 2 ? 12 : 16
    const selectedTheme = themes[theme as keyof typeof themes] || themes.animals
    const cards = selectedTheme
      .slice(0, cardCount / 2)
      .flatMap((content, index) => [
        { id: `${index}_1`, content, matched: false, flipped: false },
        { id: `${index}_2`, content, matched: false, flipped: false },
      ])
      .sort(() => Math.random() - 0.5)

    setGame({
      id: `memory_${Date.now()}`,
      cards,
      difficulty,
      theme,
    })
  }

  const resetGameState = () => {
    setFlippedCards([])
    setMatchedPairs([])
    setMoves(0)
    setTimeElapsed(0)
    setGameCompleted(false)
  }

  const handleCardClick = (cardId: string) => {
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(cardId) ||
      matchedPairs.some((pair) => {
        const card = game?.cards.find((c) => c.id === cardId)
        return card?.content === pair
      })
    ) {
      return
    }

    setFlippedCards((prev) => [...prev, cardId])
  }

  const resetGame = () => {
    setGameStarted(false)
    setGame(null)
    resetGameState()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const isCardVisible = (cardId: string) => {
    const card = game?.cards.find((c) => c.id === cardId)
    return flippedCards.includes(cardId) || matchedPairs.includes(card?.content || "")
  }

  const getScore = () => {
    return Math.max(100 - moves * 2, 0)
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/games/card-games">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Card Games
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Memory Match</h1>
            <p className="text-gray-600">Test your visual memory by matching pairs of cards</p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Configure your memory game</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select value={difficulty.toString()} onValueChange={(value) => setDifficulty(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Easy (8 cards)</SelectItem>
                    <SelectItem value="2">Medium (12 cards)</SelectItem>
                    <SelectItem value="3">Hard (16 cards)</SelectItem>
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
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="shapes">Shapes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={startGame} className="w-full" size="lg" disabled={loading}>
                {loading ? "Setting up game..." : "Start Game"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!game) return null

  const gridCols = game.cards.length === 8 ? "grid-cols-4" : game.cards.length === 12 ? "grid-cols-4" : "grid-cols-4"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button asChild variant="ghost" className="mb-2">
              <Link href="/games/card-games">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Card Games
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Memory Match</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {formatTime(timeElapsed)}
            </Badge>
            <Badge variant="outline">Moves: {moves}</Badge>
            <Badge variant="outline">
              Pairs: {matchedPairs.length}/{game.cards.length / 2}
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
                    You completed the game in {moves} moves and {formatTime(timeElapsed)} with a score of {getScore()}%!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Board */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Game Board</CardTitle>
              <Button onClick={resetGame} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                New Game
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`grid ${gridCols} gap-4 max-w-2xl mx-auto`}>
              {game.cards.map((card) => (
                <div
                  key={card.id}
                  className={`aspect-square bg-white border-2 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center text-4xl font-bold ${
                    isCardVisible(card.id)
                      ? matchedPairs.includes(card.content)
                        ? "border-green-400 bg-green-50"
                        : "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400 bg-gradient-to-br from-blue-100 to-purple-100"
                  }`}
                  onClick={() => handleCardClick(card.id)}
                >
                  {isCardVisible(card.id) ? (
                    <span className="select-none">{card.content}</span>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 rounded-md flex items-center justify-center">
                      <span className="text-2xl">?</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Game Info */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pairs Found:</span>
                  <span>
                    {matchedPairs.length}/{game.cards.length / 2}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(matchedPairs.length / (game.cards.length / 2)) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Efficiency:</span>
                  <span>{moves > 0 ? Math.round((matchedPairs.length / moves) * 100) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Score:</span>
                  <span>{getScore()}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Remember card positions</li>
                <li>• Focus on one area at a time</li>
                <li>• Use fewer moves for higher scores</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
