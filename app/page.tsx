import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Target, TrendingUp, Users, Award } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Brain className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">MindSharp</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Combat brain degeneration through scientifically-backed cognitive training. Strengthen your mind with
            personalized brain games and track your progress over time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard">Start Training</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose MindSharp?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Personalized Training</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI-powered adaptive difficulty ensures optimal challenge levels for continuous improvement
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Detailed analytics show your cognitive improvements across different brain areas
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Research-Backed</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Games designed based on neuroscience research to effectively stimulate cognitive function
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Game Categories */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Cognitive Training Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">📝 Word Puzzles</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Crosswords, word searches, and anagrams to enhance vocabulary and language processing
                </CardDescription>
                <Button asChild className="mt-4 w-full" variant="outline">
                  <Link href="/games/word-puzzles">Explore Games</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🃏 Card Games</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Memory matching, solitaire variants, and pattern recognition to boost visual memory
                </CardDescription>
                <Button asChild className="mt-4 w-full" variant="outline">
                  <Link href="/games/card-games">Explore Games</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">♟️ Board Games</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Chess, checkers, and logic puzzles for strategic thinking and planning skills
                </CardDescription>
                <Button asChild className="mt-4 w-full" variant="outline">
                  <Link href="/games/board-games">Explore Games</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🧠 Brain Training</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Processing speed, attention, and working memory exercises for cognitive enhancement
                </CardDescription>
                <Button asChild className="mt-4 w-full" variant="outline">
                  <Link href="/games/brain-training">Explore Games</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🎲 Dice Games</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Probability games and mathematical reasoning challenges for analytical thinking
                </CardDescription>
                <Button asChild className="mt-4 w-full" variant="outline">
                  <Link href="/games/dice-games">Explore Games</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Award className="h-5 w-5" />
                  Daily Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Fresh, AI-generated challenges every day to keep your training engaging
                </CardDescription>
                <Button asChild className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/daily-challenge">Today's Challenge</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Proven Results</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">85%</div>
              <p className="text-gray-600">Users report improved memory after 4 weeks</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">92%</div>
              <p className="text-gray-600">Increase in processing speed scores</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">78%</div>
              <p className="text-gray-600">Better attention span in daily tasks</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Start Your Cognitive Journey Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are actively improving their brain health with MindSharp
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/dashboard">Begin Training Now</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
