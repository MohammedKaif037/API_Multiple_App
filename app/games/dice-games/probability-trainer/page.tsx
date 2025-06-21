"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Trophy, Timer, CheckCircle, XCircle, Dice6 } from "lucide-react"
import Link from "next/link"
import { cognitiveAPI } from "@/lib/cognitive-api"

interface ProbabilityQuestion {
  id: string
  question: string
  scenario: string
  options: string[]
  correctAnswer: string
  explanation: string
  difficulty: number
}

export default function ProbabilityTrainerGame() {
  const [currentQuestion, setCurrentQuestion] = useState<ProbabilityQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds] = useState(10)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [difficulty, setDifficulty] = useState(2)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const probabilityQuestions: ProbabilityQuestion[] = [
    {
      id: "1",
      question: "What's the probability of rolling a 6 on a standard die?",
      scenario: "Single die roll",
      options: ["1/6", "1/3", "1/2", "2/3"],
      correctAnswer: "1/6",
      explanation: "A standard die has 6 faces, and only one shows a 6, so the probability is 1/6.",
      difficulty: 1,
    },
    {
      id: "2",
      question: "What's the probability of getting heads twice in a row when flipping a coin?",
      scenario: "Two coin flips",
      options: ["1/2", "1/4", "1/3", "3/4"],
      correctAnswer: "1/4",
      explanation: "Each flip has 1/2 probability of heads. For two heads: 1/2 × 1/2 = 1/4.",
      difficulty: 2,
    },
    {
      id: "3",
      question: "What's the probability of rolling two dice and getting a sum of 7?",
      scenario: "Two dice roll",
      options: ["1/6", "1/12", "1/36", "6/36"],
      correctAnswer: "6/36",
      explanation: "There are 6 ways to get 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) out of 36 total outcomes.",
      difficulty: 2,
    },
    {
      id: "4",
      question: "If you draw a card from a standard deck, what's the probability it's a heart?",
      scenario: "Card drawing",
      options: ["1/4", "1/13", "1/52", "4/52"],
      correctAnswer: "1/4",
      explanation: "There are 13 hearts in a 52-card deck, so the probability is 13/52 = 1/4.",
      difficulty: 1,
    },
    {
      id: "5",
      question: "What's the probability of rolling at least one 6 with two dice?",
      scenario: "Two dice, at least one 6",
      options: ["11/36", "1/6", "1/3", "25/36"],
      correctAnswer: "11/36",
      explanation:
        "Easier to calculate 1 - P(no 6s). P(no 6) = 5/6 for each die. P(no 6s) = (5/6)² = 25/36. So P(at least one 6) = 1 - 25/36 = 11/36.",
      difficulty: 3,
    },
    {
      id: "6",
      question: "In a bag with 3 red and 2 blue balls, what's the probability of drawing a red ball?",
      scenario: "Ball drawing",
      options: ["3/5", "2/5", "1/2", "3/2"],
      correctAnswer: "3/5",
      explanation: "There are 3 red balls out of 5 total balls, so the probability is 3/5.",
      difficulty: 1,
    },
    {
      id: "7",
      question: "What's the probability of getting exactly 2 heads in 3 coin flips?",
      scenario: "Three coin flips",
      options: ["3/8", "1/4", "1/2", "1/8"],
      correctAnswer: "3/8",
      explanation: "The favorable outcomes are HHT, HTH, THH. That's 3 out of 8 total outcomes (2³ = 8).",
      difficulty: 2,
    },
    {
      id: "8",
      question: "If you roll a die 6 times, what's the probability of getting at least one 6?",
      scenario: "Six die rolls",
      options: ["1 - (5/6)⁶", "6/6", "1/6", "(1/6)⁶"],
      correctAnswer: "1 - (5/6)⁶",
      explanation: "P(at least one 6) = 1 - P(no 6s). P(no 6 in one roll) = 5/6. P(no 6s in 6 rolls) = (5/6)⁶.",
      difficulty: 3,
    },
    {
      id: "9",
      question: "What's the probability of drawing two aces from a deck without replacement?",
      scenario: "Card drawing without replacement",
      options: ["1/221", "4/52", "1/169", "2/52"],
      correctAnswer: "1/221",
      explanation:
        "P(first ace) = 4/52. P(second ace | first ace) = 3/51. Combined: (4/52) × (3/51) = 12/2652 = 1/221.",
      difficulty: 3,
    },
    {
      id: "10",
      question: "What's the probability of rolling an even number on a standard die?",
      scenario: "Single die roll",
      options: ["1/2", "1/3", "2/3", "1/6"],
      correctAnswer: "1/2",
      explanation: "Even numbers on a die are 2, 4, 6. That's 3 out of 6 outcomes, so 3/6 = 1/2.",
      difficulty: 1,
    },
  ]

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
    generateNextQuestion()
  }

  const generateNextQuestion = () => {
    const filteredQuestions = probabilityQuestions.filter((q) => q.difficulty <= difficulty)
    const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)]
    setCurrentQuestion(randomQuestion)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return

    setSelectedAnswer(answer)
    const correct = answer === currentQuestion?.correctAnswer
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore((prev) => prev + 1)
    }

    setTimeout(() => {
      if (currentRound >= totalRounds) {
        setGameCompleted(true)
        const finalScore = Math.round((score / totalRounds) * 100)

        // Track progress
        cognitiveAPI.trackProgress({
          date: new Date().toISOString(),
          score: finalScore,
          gameType: "probability-trainer",
          difficulty,
          timeSpent: timeElapsed,
          cognitiveAreas: ["Mathematical Reasoning", "Probability", "Analytical Thinking"],
        })
      } else {
        setCurrentRound((prev) => prev + 1)
        generateNextQuestion()
      }
    }, 4000)
  }

  const resetGame = () => {
    setGameStarted(false)
    setCurrentQuestion(null)
    setSelectedAnswer(null)
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
            <h1 className="text-3xl font-bold text-gray-900">Probability Trainer</h1>
            <p className="text-gray-600">Master probability concepts through interactive challenges</p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Configure your probability training</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select value={difficulty.toString()} onValueChange={(value) => setDifficulty(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Easy (Basic probability)</SelectItem>
                    <SelectItem value="2">Medium (Compound events)</SelectItem>
                    <SelectItem value="3">Hard (Complex scenarios)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-600">
                <p>• Answer {totalRounds} probability questions</p>
                <p>• Learn about dice, cards, and coins</p>
                <p>• Understand mathematical reasoning</p>
              </div>

              <Button onClick={startGame} className="w-full" size="lg">
                Start Training
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
              <Link href="/games/dice-games">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dice Games
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Probability Trainer - Complete!</h1>
          </div>

          <Card className="max-w-md mx-auto bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-2">Great Work!</h3>
                <div className="space-y-2 text-green-700">
                  <p>
                    Score: {score}/{totalRounds} ({getFinalScore()}%)
                  </p>
                  <p>Time: {formatTime(timeElapsed)}</p>
                  <p>Difficulty: Level {difficulty}</p>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={resetGame} className="flex-1">
                    Train More
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

  if (!currentQuestion) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button asChild variant="ghost" className="mb-2">
              <Link href="/games/dice-games">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dice Games
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Probability Trainer</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {formatTime(timeElapsed)}
            </Badge>
            <Badge variant="outline">
              Question: {currentRound}/{totalRounds}
            </Badge>
            <Badge variant="outline">
              Score: {score}/{totalRounds}
            </Badge>
          </div>
        </div>

        {/* Game Area */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dice6 className="h-6 w-6" />
              Probability Challenge
            </CardTitle>
            <CardDescription>Scenario: {currentQuestion.scenario}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Question */}
            <div className="mb-8">
              <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h2 className="text-xl font-semibold text-blue-800 mb-2">{currentQuestion.question}</h2>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold">Choose the correct probability:</h3>
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === option ? (isCorrect ? "default" : "destructive") : "outline"}
                  className={`w-full text-left justify-start h-auto p-4 ${
                    showResult && option === currentQuestion.correctAnswer
                      ? "bg-green-100 border-green-400 text-green-800"
                      : ""
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{String.fromCharCode(65 + index)}.</span>
                    <span className="font-mono text-lg">{option}</span>
                    {showResult &&
                      selectedAnswer === option &&
                      (isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 ml-auto" />
                      ))}
                    {showResult && option === currentQuestion.correctAnswer && selectedAnswer !== option && (
                      <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                    )}
                  </div>
                </Button>
              ))}
            </div>

            {/* Result Feedback */}
            {showResult && (
              <div
                className={`p-4 rounded-lg ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </span>
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-l-blue-400">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Answer:</strong> {currentQuestion.correctAnswer}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="max-w-2xl mx-auto mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Training Progress</span>
              <span className="text-sm text-gray-600">
                {currentRound}/{totalRounds}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentRound / totalRounds) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
