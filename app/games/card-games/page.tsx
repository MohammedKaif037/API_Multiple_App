"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Target, Brain, Shuffle } from "lucide-react"
import { cognitiveAPI, type Game } from "@/lib/cognitive-api"
import Link from "next/link"

export default function CardGamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGames = async () => {
      try {
        const response = await cognitiveAPI.getAvailableGames()
        if (response.success && response.data) {
          const cardGames = response.data.filter((game) => game.category === "card-games")
          // Add more card games
          const additionalGames: Game[] = [
            {
              id: "solitaire-classic",
              name: "Classic Solitaire",
              category: "card-games",
              difficulty: 2,
              description: "Traditional Klondike solitaire for strategic thinking",
              estimatedTime: 15,
              cognitiveAreas: ["Strategic Thinking", "Planning", "Pattern Recognition"],
            },
            {
              id: "concentration",
              name: "Concentration",
              category: "card-games",
              difficulty: 1,
              description: "Match pairs of cards to improve visual memory",
              estimatedTime: 8,
              cognitiveAreas: ["Visual Memory", "Attention", "Processing Speed"],
            },
            {
              id: "sequence-memory",
              name: "Sequence Memory",
              category: "card-games",
              difficulty: 3,
              description: "Remember and repeat card sequences",
              estimatedTime: 10,
              cognitiveAreas: ["Sequential Memory", "Working Memory", "Attention"],
            },
            {
              id: "card-matching",
              name: "Speed Matching",
              category: "card-games",
              difficulty: 2,
              description: "Quickly match cards by color, number, or suit",
              estimatedTime: 6,
              cognitiveAreas: ["Processing Speed", "Visual Processing", "Attention"],
            },
          ]
          const allCardGames = [...cardGames, ...additionalGames]
          setGames(allCardGames)
          setFilteredGames(allCardGames)
        }
      } catch (error) {
        console.error("Failed to load games:", error)
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [])

  useEffect(() => {
    if (selectedDifficulty === "all") {
      setFilteredGames(games)
    } else {
      const difficulty = Number.parseInt(selectedDifficulty)
      setFilteredGames(games.filter((game) => game.difficulty === difficulty))
    }
  }, [selectedDifficulty, games])

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "bg-green-100 text-green-800"
      case 2:
        return "bg-yellow-100 text-yellow-800"
      case 3:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "Easy"
      case 2:
        return "Medium"
      case 3:
        return "Hard"
      default:
        return "Unknown"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Shuffle className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading card games...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">🃏 Card Games</h1>
          <p className="text-gray-600 mb-6">Strengthen visual memory, pattern recognition, and strategic thinking</p>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Difficulty:</label>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Easy</SelectItem>
                <SelectItem value="2">Medium</SelectItem>
                <SelectItem value="3">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mb-8 bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">Cognitive Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span>Enhances visual memory and recall</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span>Improves pattern recognition</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>Develops strategic planning</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <Card key={game.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{game.name}</CardTitle>
                  <Badge className={getDifficultyColor(game.difficulty)}>{getDifficultyText(game.difficulty)}</Badge>
                </div>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {game.estimatedTime} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Level {game.difficulty}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Cognitive Areas:</p>
                    <div className="flex flex-wrap gap-1">
                      {game.cognitiveAreas.map((area, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {game.id === "concentration" ? (
                    <Button asChild className="mt-4 w-full">
                      <Link href="/games/card-games/memory-match">Play Memory Match</Link>
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" disabled>
                      Coming Soon
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No games found for the selected difficulty level.</p>
            <Button variant="outline" onClick={() => setSelectedDifficulty("all")} className="mt-4">
              Show All Games
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
