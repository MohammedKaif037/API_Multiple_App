"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Clock, Target, Brain } from "lucide-react"
import { cognitiveAPI, type Game } from "@/lib/cognitive-api"
import Link from "next/link"

export default function WordPuzzlesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGames = async () => {
      try {
        const response = await cognitiveAPI.getAvailableGames()
        if (response.success && response.data) {
          const wordPuzzleGames = response.data.filter((game) => game.category === "word-puzzles")
          // Add more word puzzle games
          const additionalGames: Game[] = [
            {
              id: "anagram-solver",
              name: "Anagram Solver",
              category: "word-puzzles",
              difficulty: 2,
              description: "Unscramble letters to form words and improve vocabulary",
              estimatedTime: 8,
              cognitiveAreas: ["Language", "Problem Solving", "Pattern Recognition"],
            },
            {
              id: "vocabulary-builder",
              name: "Vocabulary Builder",
              category: "word-puzzles",
              difficulty: 1,
              description: "Learn new words and test your vocabulary knowledge",
              estimatedTime: 12,
              cognitiveAreas: ["Language", "Memory", "Learning"],
            },
            {
              id: "word-association",
              name: "Word Association",
              category: "word-puzzles",
              difficulty: 3,
              description: "Connect related words to enhance semantic memory",
              estimatedTime: 10,
              cognitiveAreas: ["Language", "Memory", "Creative Thinking"],
            },
          ]
          const allWordGames = [...wordPuzzleGames, ...additionalGames]
          setGames(allWordGames)
          setFilteredGames(allWordGames)
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
          <Brain className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading word puzzle games...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">📝 Word Puzzles</h1>
          <p className="text-gray-600 mb-6">
            Enhance your vocabulary, language processing, and verbal reasoning skills
          </p>

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
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Cognitive Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span>Improves vocabulary and language skills</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span>Enhances pattern recognition</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Boosts processing speed</span>
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

                  {game.id === "anagram-solver" && (
                    <Button asChild className="w-full" size="lg">
                      <Link href="/games/word-puzzles/anagram-solver">
                        <Play className="h-4 w-4 mr-2" />
                        Play Anagram Solver
                      </Link>
                    </Button>
                  )}

                  {game.id === "vocabulary-builder" && (
                    <Button asChild className="w-full" size="lg">
                      <Link href="/games/word-puzzles/vocabulary-builder">
                        <Play className="h-4 w-4 mr-2" />
                        Play Vocabulary Builder
                      </Link>
                    </Button>
                  )}

                  {game.id === "word-association" && (
                    <Button asChild className="w-full" size="lg">
                      <Link href="/games/word-puzzles/word-association">
                        <Play className="h-4 w-4 mr-2" />
                        Play Word Association
                      </Link>
                    </Button>
                  )}

                  {game.id === "crossword" && (
                    <Button asChild className="w-full" size="lg">
                      <Link href="/games/word-puzzles/crossword">
                        <Play className="h-4 w-4 mr-2" />
                        Play Crossword
                      </Link>
                    </Button>
                  )}

                  {game.id === "word-search" && (
                    <Button asChild className="w-full" size="lg">
                      <Link href="/games/word-puzzles/word-search">
                        <Play className="h-4 w-4 mr-2" />
                        Play Word Search
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add links to the new games */}
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild className="mt-4 w-full" variant="outline">
            <Link href="/games/word-puzzles/crossword">Play Crossword</Link>
          </Button>
          <Button asChild className="mt-4 w-full" variant="outline">
            <Link href="/games/word-puzzles/word-search">Play Word Search</Link>
          </Button>
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
