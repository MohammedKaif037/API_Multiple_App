"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Trophy, Flame, Star, Target, Brain, Zap } from "lucide-react"
import Link from "next/link"
import { cognitiveAPI, type Game } from "@/lib/cognitive-api"

interface DailyChallenge {
  id: string
  date: string
  game: Game
  bonusPoints: number
  timeLimit: number
  description: string
  completed: boolean
  score?: number
}

interface UserStreak {
  currentStreak: number
  longestStreak: number
  totalChallengesCompleted: number
  lastCompletedDate: string
}

export default function DailyChallengePage() {
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null)
  const [userStreak, setUserStreak] = useState<UserStreak>({
    currentStreak: 7,
    longestStreak: 12,
    totalChallengesCompleted: 45,
    lastCompletedDate: "2024-01-20",
  })
  const [loading, setLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: "Alex Chen", score: 2850, streak: 15 },
    { rank: 2, name: "Sarah Kim", score: 2720, streak: 12 },
    { rank: 3, name: "Mike Johnson", score: 2680, streak: 8 },
    { rank: 4, name: "Emma Davis", score: 2540, streak: 10 },
    { rank: 5, name: "You", score: 2420, streak: 7 },
  ])

  useEffect(() => {
    loadDailyChallenge()
  }, [])

  const loadDailyChallenge = async () => {
    try {
      const response = await cognitiveAPI.getDailyChallenge()
      if (response.success && response.data) {
        const today = new Date().toISOString().split("T")[0]
        const challenge: DailyChallenge = {
          id: `daily_${today}`,
          date: today,
          game: response.data,
          bonusPoints: Math.floor(Math.random() * 500) + 100,
          timeLimit: 300, // 5 minutes
          description: getDailyChallengeDescription(response.data),
          completed: false,
        }
        setDailyChallenge(challenge)
      }
    } catch (error) {
      console.error("Failed to load daily challenge:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDailyChallengeDescription = (game: Game): string => {
    const descriptions = {
      crossword: "Solve today's themed crossword puzzle with bonus time pressure!",
      "memory-cards": "Match all pairs in record time for maximum points!",
      "word-search": "Find all hidden words in today's challenging grid!",
      "pattern-recognition": "Identify complex patterns faster than ever before!",
      chess: "Solve tactical chess puzzles with increasing difficulty!",
    }
    return descriptions[game.id as keyof typeof descriptions] || `Master today's ${game.name} challenge!`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 10) return "text-orange-500"
    if (streak >= 5) return "text-yellow-500"
    return "text-blue-500"
  }

  const getGameRoute = (gameId: string) => {
    const routes = {
      crossword: "/games/word-puzzles/crossword",
      "memory-cards": "/games/card-games/memory-match",
      "word-search": "/games/word-puzzles/word-search",
      "pattern-recognition": "/games/brain-training/pattern-recognition",
      chess: "/games/board-games/chess-puzzles",
    }
    return routes[gameId as keyof typeof routes] || "/games"
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-500" />
            <p className="text-lg text-muted-foreground">Loading today's challenge...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Calendar className="h-8 w-8 text-blue-500" />
          <h1 className="text-4xl font-bold">Daily Challenge</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Take on today's specially curated cognitive challenge and compete with players worldwide!
        </p>
        <div className="text-sm text-muted-foreground">{formatDate(new Date().toISOString().split("T")[0])}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Challenge */}
        <div className="lg:col-span-2 space-y-6">
          {dailyChallenge && (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-blue-500" />
                    <CardTitle className="text-2xl">Today's Challenge</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    +{dailyChallenge.bonusPoints} Bonus Points
                  </Badge>
                </div>
                <CardDescription className="text-lg">{dailyChallenge.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold">{dailyChallenge.game.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-green-500" />
                      <span>Time Limit: {Math.floor(dailyChallenge.timeLimit / 60)} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <span>Difficulty: {dailyChallenge.game.difficulty}/3</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Cognitive Areas:</h4>
                    <div className="flex flex-wrap gap-1">
                      {dailyChallenge.game.cognitiveAreas.map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={getGameRoute(dailyChallenge.game.id)} className="flex-1">
                    <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                      <Target className="h-5 w-5 mr-2" />
                      Start Challenge
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="flex-1">
                    <Star className="h-5 w-5 mr-2" />
                    View Rules
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Previous Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "2024-01-20", game: "Memory Cards", score: 850, completed: true },
                  { date: "2024-01-19", game: "Word Search", score: 720, completed: true },
                  { date: "2024-01-18", game: "Pattern Recognition", score: 0, completed: false },
                  { date: "2024-01-17", game: "Crossword", score: 940, completed: true },
                ].map((challenge, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${challenge.completed ? "bg-green-500" : "bg-gray-300"}`} />
                      <div>
                        <div className="font-medium">{challenge.game}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(challenge.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {challenge.completed ? (
                        <div className="font-semibold text-green-600">{challenge.score} pts</div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Not completed</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Streak Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className={`h-5 w-5 ${getStreakColor(userStreak.currentStreak)}`} />
                Your Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getStreakColor(userStreak.currentStreak)}`}>
                  {userStreak.currentStreak}
                </div>
                <div className="text-sm text-muted-foreground">Days in a row</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to next milestone</span>
                  <span>{userStreak.currentStreak}/10</span>
                </div>
                <Progress value={(userStreak.currentStreak / 10) * 100} className="h-2" />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-500">{userStreak.longestStreak}</div>
                  <div className="text-xs text-muted-foreground">Longest Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">{userStreak.totalChallengesCompleted}</div>
                  <div className="text-xs text-muted-foreground">Total Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Leaderboard
              </CardTitle>
              <CardDescription>Top performers this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-2 rounded ${
                      player.name === "You" ? "bg-blue-50 border border-blue-200" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          player.rank === 1
                            ? "bg-yellow-100 text-yellow-700"
                            : player.rank === 2
                              ? "bg-gray-100 text-gray-700"
                              : player.rank === 3
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {player.rank}
                      </div>
                      <div>
                        <div className={`font-medium ${player.name === "You" ? "text-blue-700" : ""}`}>
                          {player.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {player.streak}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold">{player.score}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded bg-green-50">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">🔥</div>
                  <div className="flex-1">
                    <div className="font-medium text-green-700">Week Warrior</div>
                    <div className="text-xs text-green-600">7-day streak achieved!</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded border-2 border-dashed border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">🏆</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-600">Perfect Ten</div>
                    <div className="text-xs text-gray-500">3/10 perfect scores</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
