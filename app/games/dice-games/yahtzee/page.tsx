"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react"
import Link from "next/link"
import { cognitiveAPI } from "@/lib/cognitive-api"

interface ScoreCategory {
  name: string
  key: string
  score: number | null
  description: string
}

export default function YahtzeeGame() {
  const [dice, setDice] = useState<number[]>([1, 1, 1, 1, 1])
  const [heldDice, setHeldDice] = useState<boolean[]>([false, false, false, false, false])
  const [rollsLeft, setRollsLeft] = useState(3)
  const [currentRound, setCurrentRound] = useState(1)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [scoreCard, setScoreCard] = useState<ScoreCategory[]>([
    { name: "Ones", key: "ones", score: null, description: "Sum of all 1s" },
    { name: "Twos", key: "twos", score: null, description: "Sum of all 2s" },
    { name: "Threes", key: "threes", score: null, description: "Sum of all 3s" },
    { name: "Fours", key: "fours", score: null, description: "Sum of all 4s" },
    { name: "Fives", key: "fives", score: null, description: "Sum of all 5s" },
    { name: "Sixes", key: "sixes", score: null, description: "Sum of all 6s" },
    { name: "Three of a Kind", key: "threeOfKind", score: null, description: "Sum of all dice if 3+ same" },
    { name: "Four of a Kind", key: "fourOfKind", score: null, description: "Sum of all dice if 4+ same" },
    { name: "Full House", key: "fullHouse", score: null, description: "25 points for 3+2 of same" },
    { name: "Small Straight", key: "smallStraight", score: null, description: "30 points for 4 consecutive" },
    { name: "Large Straight", key: "largeStraight", score: null, description: "40 points for 5 consecutive" },
    { name: "Yahtzee", key: "yahtzee", score: null, description: "50 points for 5 of same" },
    { name: "Chance", key: "chance", score: null, description: "Sum of all dice" },
  ])

  const getDiceIcon = (value: number) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]
    const Icon = icons[value - 1]
    return <Icon className="h-8 w-8" />
  }

  const rollDice = () => {
    if (rollsLeft <= 0) return

    const newDice = dice.map((die, index) => (heldDice[index] ? die : Math.floor(Math.random() * 6) + 1))
    setDice(newDice)
    setRollsLeft((prev) => prev - 1)
  }

  const toggleHoldDie = (index: number) => {
    if (rollsLeft === 3) return // Can't hold dice before first roll

    const newHeldDice = [...heldDice]
    newHeldDice[index] = !newHeldDice[index]
    setHeldDice(newHeldDice)
  }

  const calculateScore = (category: string): number => {
    const counts = dice.reduce(
      (acc, die) => {
        acc[die] = (acc[die] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const values = Object.values(counts)
    const sum = dice.reduce((a, b) => a + b, 0)

    switch (category) {
      case "ones":
        return dice.filter((d) => d === 1).length * 1
      case "twos":
        return dice.filter((d) => d === 2).length * 2
      case "threes":
        return dice.filter((d) => d === 3).length * 3
      case "fours":
        return dice.filter((d) => d === 4).length * 4
      case "fives":
        return dice.filter((d) => d === 5).length * 5
      case "sixes":
        return dice.filter((d) => d === 6).length * 6
      case "threeOfKind":
        return values.some((count) => count >= 3) ? sum : 0
      case "fourOfKind":
        return values.some((count) => count >= 4) ? sum : 0
      case "fullHouse":
        return values.includes(3) && values.includes(2) ? 25 : 0
      case "smallStraight": {
        const sorted = [...new Set(dice)].sort()
        const straights = [
          [1, 2, 3, 4],
          [2, 3, 4, 5],
          [3, 4, 5, 6],
        ]
        return straights.some((straight) => straight.every((num) => sorted.includes(num))) ? 30 : 0
      }
      case "largeStraight": {
        const sorted = [...new Set(dice)].sort()
        return sorted.length === 5 && sorted[4] - sorted[0] === 4 ? 40 : 0
      }
      case "yahtzee":
        return values.includes(5) ? 50 : 0
      case "chance":
        return sum
      default:
        return 0
    }
  }

  const scoreCategory = (categoryKey: string) => {
    const score = calculateScore(categoryKey)
    const newScoreCard = scoreCard.map((category) => (category.key === categoryKey ? { ...category, score } : category))
    setScoreCard(newScoreCard)

    // Reset for next turn
    setHeldDice([false, false, false, false, false])
    setRollsLeft(3)
    setCurrentRound((prev) => prev + 1)

    // Check if game is complete
    if (newScoreCard.every((category) => category.score !== null)) {
      setGameCompleted(true)
      const totalScore = getTotalScore(newScoreCard)

      // Track progress
      cognitiveAPI.trackProgress({
        date: new Date().toISOString(),
        score: Math.min(totalScore / 3, 100), // Normalize score
        gameType: "yahtzee",
        difficulty: 2,
        timeSpent: currentRound * 2, // Estimate time
        cognitiveAreas: ["Mathematical Reasoning", "Probability", "Strategic Thinking"],
      })
    }
  }

  const getTotalScore = (scoreCardToUse = scoreCard) => {
    const upperSection = scoreCardToUse.slice(0, 6).reduce((sum, category) => sum + (category.score || 0), 0)
    const upperBonus = upperSection >= 63 ? 35 : 0
    const lowerSection = scoreCardToUse.slice(6).reduce((sum, category) => sum + (category.score || 0), 0)
    return upperSection + upperBonus + lowerSection
  }

  const startGame = () => {
    setGameStarted(true)
    setDice([1, 1, 1, 1, 1])
    setHeldDice([false, false, false, false, false])
    setRollsLeft(3)
    setCurrentRound(1)
    setGameCompleted(false)
    setScoreCard(scoreCard.map((category) => ({ ...category, score: null })))
  }

  const resetGame = () => {
    setGameStarted(false)
    startGame()
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/games/dice-games">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dice Games
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Yahtzee</h1>
            <p className="text-gray-600">Classic dice game of probability and strategy</p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>How to Play</CardTitle>
              <CardDescription>Roll dice to achieve scoring combinations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Roll 5 dice up to 3 times per turn</p>
                <p>• Hold dice between rolls by clicking them</p>
                <p>• Score in 13 different categories</p>
                <p>• Try to get the highest total score!</p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Scoring Examples:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Yahtzee (5 of a kind): 50 points</li>
                  <li>• Full House (3+2): 25 points</li>
                  <li>• Large Straight: 40 points</li>
                  <li>• Upper section bonus: 35 points (if ≥63)</li>
                </ul>
              </div>

              <Button onClick={startGame} className="w-full" size="lg">
                Start Game
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (gameCompleted) {
    const totalScore = getTotalScore()
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/games/dice-games">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dice Games
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Yahtzee - Game Complete!</h1>
          </div>

          <Card className="max-w-md mx-auto bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-2">Game Complete!</h3>
                <div className="space-y-2 text-green-700">
                  <p className="text-3xl font-bold">{totalScore} points</p>
                  <p>
                    {totalScore >= 300
                      ? "Excellent!"
                      : totalScore >= 250
                        ? "Great job!"
                        : totalScore >= 200
                          ? "Good game!"
                          : "Keep practicing!"}
                  </p>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={resetGame} className="flex-1">
                    Play Again
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/games/dice-games">Back to Games</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button asChild variant="ghost" className="mb-2">
              <Link href="/games/dice-games">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dice Games
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Yahtzee</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">Round: {currentRound}/13</Badge>
            <Badge variant="outline">Rolls Left: {rollsLeft}</Badge>
            <Badge variant="outline">Score: {getTotalScore()}</Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Dice Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Dice</CardTitle>
                <CardDescription>
                  {rollsLeft === 3
                    ? "Click 'Roll Dice' to start your turn"
                    : rollsLeft > 0
                      ? "Click dice to hold them, then roll again"
                      : "Choose a category to score"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-4 mb-6">
                  {dice.map((die, index) => (
                    <div key={index} className="text-center">
                      <Button
                        variant={heldDice[index] ? "default" : "outline"}
                        className={`w-16 h-16 p-2 ${heldDice[index] ? "bg-blue-100 border-blue-400" : ""}`}
                        onClick={() => toggleHoldDie(index)}
                        disabled={rollsLeft === 3}
                      >
                        {getDiceIcon(die)}
                      </Button>
                      {heldDice[index] && rollsLeft < 3 && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          HELD
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Button onClick={rollDice} disabled={rollsLeft <= 0} size="lg" className="mb-4">
                    Roll Dice ({rollsLeft} left)
                  </Button>
                  <div className="text-sm text-gray-600">
                    {rollsLeft === 3 && "Start by rolling all dice"}
                    {rollsLeft === 2 && "Click dice to hold them before rolling again"}
                    {rollsLeft === 1 && "Last roll - choose wisely!"}
                    {rollsLeft === 0 && "Select a category to score"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Score Card */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Score Card</CardTitle>
                <CardDescription>Choose a category to score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {scoreCard.map((category) => (
                    <Button
                      key={category.key}
                      variant={category.score !== null ? "secondary" : "outline"}
                      className="w-full justify-between h-auto p-3"
                      onClick={() => scoreCategory(category.key)}
                      disabled={category.score !== null || rollsLeft === 3}
                    >
                      <div className="text-left">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                      <div className="text-right">
                        {category.score !== null ? (
                          <Badge variant="secondary">{category.score}</Badge>
                        ) : rollsLeft < 3 ? (
                          <Badge variant="outline">{calculateScore(category.key)}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Score:</span>
                    <Badge variant="default" className="text-lg px-3 py-1">
                      {getTotalScore()}
                    </Badge>
                  </div>
                  {scoreCard.slice(0, 6).reduce((sum, cat) => sum + (cat.score || 0), 0) >= 63 && (
                    <div className="text-sm text-green-600 mt-2">✓ Upper section bonus: +35 points</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
