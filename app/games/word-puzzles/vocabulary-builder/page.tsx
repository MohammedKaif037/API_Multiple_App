"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Trophy, Timer, CheckCircle, XCircle, BookOpen } from "lucide-react"
import Link from "next/link"
import { cognitiveAPI } from "@/lib/cognitive-api"

interface VocabularyQuestion {
  id: string
  word: string
  definition: string
  options: string[]
  correctAnswer: string
  difficulty: number
  category: string
  example: string
}

export default function VocabularyBuilderGame() {
  const [currentQuestion, setCurrentQuestion] = useState<VocabularyQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds] = useState(15)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [difficulty, setDifficulty] = useState(2)
  const [category, setCategory] = useState("general")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const vocabularyQuestions: VocabularyQuestion[] = [
    {
      id: "1",
      word: "ABUNDANT",
      definition: "Existing in large quantities; plentiful",
      options: ["Scarce", "Plentiful", "Expensive", "Difficult"],
      correctAnswer: "Plentiful",
      difficulty: 1,
      category: "general",
      example: "The garden had an abundant harvest this year.",
    },
    {
      id: "2",
      word: "METICULOUS",
      definition: "Showing great attention to detail; very careful",
      options: ["Careless", "Quick", "Precise", "Lazy"],
      correctAnswer: "Precise",
      difficulty: 2,
      category: "general",
      example: "She was meticulous in her research, checking every source.",
    },
    {
      id: "3",
      word: "UBIQUITOUS",
      definition: "Present, appearing, or found everywhere",
      options: ["Rare", "Everywhere", "Hidden", "Expensive"],
      correctAnswer: "Everywhere",
      difficulty: 3,
      category: "academic",
      example: "Smartphones have become ubiquitous in modern society.",
    },
    {
      id: "4",
      word: "BENEVOLENT",
      definition: "Well-meaning and kindly",
      options: ["Mean", "Kind", "Angry", "Confused"],
      correctAnswer: "Kind",
      difficulty: 2,
      category: "general",
      example: "The benevolent king was loved by all his subjects.",
    },
    {
      id: "5",
      word: "EPHEMERAL",
      definition: "Lasting for a very short time",
      options: ["Permanent", "Temporary", "Heavy", "Bright"],
      correctAnswer: "Temporary",
      difficulty: 3,
      category: "academic",
      example: "The beauty of cherry blossoms is ephemeral.",
    },
    {
      id: "6",
      word: "PRAGMATIC",
      definition: "Dealing with things sensibly and realistically",
      options: ["Dreamy", "Practical", "Emotional", "Artistic"],
      correctAnswer: "Practical",
      difficulty: 2,
      category: "general",
      example: "She took a pragmatic approach to solving the problem.",
    },
    {
      id: "7",
      word: "RESILIENT",
      definition: "Able to withstand or recover quickly from difficult conditions",
      options: ["Weak", "Strong", "Flexible", "Rigid"],
      correctAnswer: "Strong",
      difficulty: 1,
      category: "general",
      example: "Children are remarkably resilient and adapt quickly to change.",
    },
    {
      id: "8",
      word: "ELOQUENT",
      definition: "Fluent or persuasive in speaking or writing",
      options: ["Silent", "Articulate", "Confused", "Boring"],
      correctAnswer: "Articulate",
      difficulty: 2,
      category: "academic",
      example: "The speaker gave an eloquent presentation that moved the audience.",
    },
    {
      id: "9",
      word: "SERENDIPITY",
      definition: "The occurrence of events by chance in a happy way",
      options: ["Bad luck", "Hard work", "Happy accident", "Planning"],
      correctAnswer: "Happy accident",
      difficulty: 3,
      category: "academic",
      example: "Finding that book was pure serendipity - exactly what I needed!",
    },
    {
      id: "10",
      word: "TENACIOUS",
      definition: "Tending to keep a firm hold; persistent",
      options: ["Giving up", "Persistent", "Lazy", "Forgetful"],
      correctAnswer: "Persistent",
      difficulty: 2,
      category: "general",
      example: "Her tenacious spirit helped her overcome many obstacles.",
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
    const filteredQuestions = vocabularyQuestions.filter((q) => q.difficulty <= difficulty)
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
          gameType: "vocabulary-builder",
          difficulty,
          timeSpent: timeElapsed,
          cognitiveAreas: ["Language", "Memory", "Learning"],
        })
      } else {
        setCurrentRound((prev) => prev + 1)
        generateNextQuestion()
      }
    }, 2500)
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
              <Link href="/games/word-puzzles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Word Puzzles
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Vocabulary Builder</h1>
            <p className="text-gray-600">Expand your vocabulary with word definitions and meanings</p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Configure your vocabulary challenge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select value={difficulty.toString()} onValueChange={(value) => setDifficulty(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Easy (Common words)</SelectItem>
                    <SelectItem value="2">Medium (Intermediate words)</SelectItem>
                    <SelectItem value="3">Hard (Advanced words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Vocabulary</SelectItem>
                    <SelectItem value="academic">Academic Words</SelectItem>
                    <SelectItem value="business">Business Terms</SelectItem>
                    <SelectItem value="science">Scientific Terms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-600">
                <p>• Answer {totalRounds} vocabulary questions</p>
                <p>• Match words with their definitions</p>
                <p>• Learn new words and their usage</p>
              </div>

              <Button onClick={startGame} className="w-full" size="lg">
                Start Learning
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
              <Link href="/games/word-puzzles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Word Puzzles
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Vocabulary Builder - Complete!</h1>
          </div>

          <Card className="max-w-md mx-auto bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-2">Great Job!</h3>
                <div className="space-y-2 text-green-700">
                  <p>
                    Score: {score}/{totalRounds} ({getFinalScore()}%)
                  </p>
                  <p>Time: {formatTime(timeElapsed)}</p>
                  <p>Words Learned: {score}</p>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={resetGame} className="flex-1">
                    Learn More
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/games/word-puzzles">Back to Games</Link>
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
              <Link href="/games/word-puzzles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Word Puzzles
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Vocabulary Builder</h1>
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
              <BookOpen className="h-6 w-6" />
              What does this word mean?
            </CardTitle>
            <CardDescription>Choose the best definition for the word below</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Word Display */}
            <div className="mb-8">
              <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h2 className="text-4xl font-bold text-blue-800 mb-2">{currentQuestion.word}</h2>
                <p className="text-blue-600 italic">"{currentQuestion.definition}"</p>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold">Choose the correct meaning:</h3>
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
                    <span>{option}</span>
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
                    <strong>Example usage:</strong>
                  </p>
                  <p className="text-gray-600 italic">"{currentQuestion.example}"</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="max-w-2xl mx-auto mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Learning Progress</span>
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
