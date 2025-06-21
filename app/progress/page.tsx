"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Minus, Brain, Target, Clock, Award } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock data for demonstration
const progressData = [
  { date: "2024-01-01", memory: 65, attention: 70, processing: 60, problemSolving: 55 },
  { date: "2024-01-08", memory: 68, attention: 72, processing: 63, problemSolving: 58 },
  { date: "2024-01-15", memory: 72, attention: 75, processing: 67, problemSolving: 62 },
  { date: "2024-01-22", memory: 75, attention: 78, processing: 70, problemSolving: 65 },
  { date: "2024-01-29", memory: 78, attention: 80, processing: 73, problemSolving: 68 },
  { date: "2024-02-05", memory: 82, attention: 83, processing: 76, problemSolving: 72 },
  { date: "2024-02-12", memory: 85, attention: 85, processing: 78, problemSolving: 75 },
]

const gameTypeData = [
  { name: "Word Puzzles", sessions: 24, avgScore: 82, timeSpent: 180 },
  { name: "Card Games", sessions: 18, avgScore: 78, timeSpent: 144 },
  { name: "Board Games", sessions: 12, avgScore: 85, timeSpent: 360 },
  { name: "Brain Training", sessions: 30, avgScore: 76, timeSpent: 240 },
  { name: "Dice Games", sessions: 8, avgScore: 80, timeSpent: 64 },
]

const cognitiveAreasData = [
  { name: "Memory", value: 85, color: "#3B82F6" },
  { name: "Attention", value: 85, color: "#10B981" },
  { name: "Processing Speed", value: 78, color: "#F59E0B" },
  { name: "Problem Solving", value: 75, color: "#EF4444" },
]

export default function ProgressPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("week")

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return "text-green-600"
    if (current < previous) return "text-red-600"
    return "text-gray-600"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">📊 Progress Tracking</h1>
          <p className="text-gray-600">Monitor your cognitive improvement across different brain areas</p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">81%</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {getTrendIcon(81, 76)}
                <span className={getTrendColor(81, 76)}>+5% from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Games Completed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {getTrendIcon(92, 85)}
                <span className={getTrendColor(92, 85)}>+7 from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">16.2h</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {getTrendIcon(16.2, 14.8)}
                <span className={getTrendColor(16.2, 14.8)}>+1.4h from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 days</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {getTrendIcon(12, 7)}
                <span className={getTrendColor(12, 7)}>+5 days from last week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cognitive">Cognitive Areas</TabsTrigger>
            <TabsTrigger value="games">Game Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cognitive Progress Over Time</CardTitle>
                <CardDescription>Track your improvement across different cognitive areas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="memory" stroke="#3B82F6" strokeWidth={2} name="Memory" />
                    <Line type="monotone" dataKey="attention" stroke="#10B981" strokeWidth={2} name="Attention" />
                    <Line
                      type="monotone"
                      dataKey="processing"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      name="Processing Speed"
                    />
                    <Line
                      type="monotone"
                      dataKey="problemSolving"
                      stroke="#EF4444"
                      strokeWidth={2}
                      name="Problem Solving"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Current Performance */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Cognitive Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cognitiveAreasData.map((area) => (
                      <div key={area.name}>
                        <div className="flex justify-between text-sm mb-2">
                          <span>{area.name}</span>
                          <span className="font-medium">{area.value}%</span>
                        </div>
                        <Progress value={area.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cognitive Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={cognitiveAreasData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {cognitiveAreasData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {cognitiveAreasData.map((area) => (
                      <div key={area.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
                        <span>{area.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cognitive" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {cognitiveAreasData.map((area) => (
                <Card key={area.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {area.name}
                      <Badge variant="secondary">{area.value}%</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={area.value} className="mb-4" />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Current Level:</span>
                        <span className="font-medium">
                          {area.value >= 90
                            ? "Excellent"
                            : area.value >= 80
                              ? "Good"
                              : area.value >= 70
                                ? "Average"
                                : "Needs Improvement"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Improvement:</span>
                        <span className="text-green-600 font-medium">+{Math.floor(Math.random() * 10 + 5)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Games Played:</span>
                        <span className="font-medium">{Math.floor(Math.random() * 20 + 10)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Performance by Category</CardTitle>
                <CardDescription>Your performance across different game types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gameTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgScore" fill="#3B82F6" name="Average Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              {gameTypeData.map((game) => (
                <Card key={game.name}>
                  <CardHeader>
                    <CardTitle className="text-lg">{game.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Sessions:</span>
                        <span className="font-medium">{game.sessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Score:</span>
                        <span className="font-medium">{game.avgScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Time Spent:</span>
                        <span className="font-medium">
                          {Math.floor(game.timeSpent / 60)}h {game.timeSpent % 60}m
                        </span>
                      </div>
                      <Progress value={game.avgScore} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      Excellent attention span improvement (+15% this month)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      Strong performance in memory-based games
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      Consistent daily training streak
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      Rapid adaptation to increased difficulty levels
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      Processing speed could benefit from more practice
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      Try more challenging problem-solving games
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      Increase variety in game types played
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      Focus on timed exercises for speed improvement
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>Personalized suggestions based on your progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">🎯 Focus Area: Processing Speed</h4>
                    <p className="text-sm text-yellow-700">
                      Your processing speed has improved by 18% but still has room for growth. Try the "Speed Matching"
                      card game and "Quick Pattern" exercises 3 times this week.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">🧠 Challenge Yourself</h4>
                    <p className="text-sm text-purple-700">
                      You're excelling at medium difficulty games! It's time to try hard-level crosswords and chess
                      puzzles to continue your cognitive growth.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">⭐ Maintain Momentum</h4>
                    <p className="text-sm text-green-700">
                      Your 12-day streak is impressive! Keep up the daily practice to maximize neuroplasticity benefits.
                      Aim for 15-20 minutes per day.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
