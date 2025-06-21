import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Target, Users, Award, BookOpen, Shield } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Brain className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About MindSharp</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            MindSharp is a scientifically-backed cognitive stimulation platform designed to help combat brain
            degeneration through engaging, personalized brain training exercises.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-800">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              We believe that cognitive health is fundamental to living a fulfilling life. Our mission is to provide
              accessible, evidence-based brain training tools that help individuals maintain and improve their cognitive
              abilities throughout their lives. By combining cutting-edge AI technology with proven neuroscience
              research, we make cognitive training both effective and enjoyable.
            </p>
          </CardContent>
        </Card>

        {/* Scientific Foundation */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Scientific Foundation</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Research-Backed Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Our games are based on decades of neuroscience research showing that targeted cognitive training can
                  improve brain function and potentially slow cognitive decline.
                </p>
                <div className="space-y-2">
                  <Badge variant="outline">Neuroplasticity Research</Badge>
                  <Badge variant="outline">Cognitive Reserve Theory</Badge>
                  <Badge variant="outline">Working Memory Training</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Targeted Cognitive Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Each game targets specific cognitive domains that are crucial for daily functioning and are often
                  affected by aging or neurological conditions.
                </p>
                <div className="space-y-2">
                  <Badge variant="outline">Working Memory</Badge>
                  <Badge variant="outline">Processing Speed</Badge>
                  <Badge variant="outline">Executive Function</Badge>
                  <Badge variant="outline">Attention Control</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Brain className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>AI-Powered Adaptation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our AI analyzes your performance in real-time and adjusts difficulty levels to maintain optimal
                  challenge and maximize cognitive benefits.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-8 w-8 text-yellow-600 mb-2" />
                <CardTitle>Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Detailed analytics show your improvement over time across different cognitive areas, helping you
                  understand your strengths and areas for growth.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Accessibility First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Designed with accessibility in mind, featuring adjustable font sizes, high contrast modes, and
                  intuitive interfaces suitable for all ages and abilities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Game Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">📝 Word Puzzles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">
                  Enhance vocabulary, language processing, and verbal reasoning through crosswords, word searches, and
                  anagram challenges.
                </p>
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs">
                    Language Processing
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Verbal Memory
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🃏 Card Games</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">
                  Strengthen visual memory and pattern recognition through memory matching, solitaire variants, and
                  strategic card games.
                </p>
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs">
                    Visual Memory
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Pattern Recognition
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">♟️ Board Games</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">
                  Develop strategic thinking and planning skills through chess, checkers, and logic puzzle challenges.
                </p>
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs">
                    Strategic Thinking
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Planning
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🧠 Brain Training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">
                  Target specific cognitive functions with processing speed tests, attention exercises, and working
                  memory challenges.
                </p>
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs">
                    Processing Speed
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Working Memory
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🎲 Dice Games</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">
                  Enhance mathematical reasoning and probability understanding through dice-based games and statistical
                  challenges.
                </p>
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs">
                    Mathematical Reasoning
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Probability
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">🎯 Daily Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">
                  Fresh, AI-generated challenges every day to keep your training engaging and prevent adaptation
                  plateaus.
                </p>
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs">
                    Adaptive Difficulty
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Variety
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Privacy & Security */}
        <Card className="mb-8 bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-gray-700" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Data Protection</h4>
                <p className="text-sm text-gray-600">
                  Your cognitive data and progress information are encrypted and stored securely. We never share
                  personal information with third parties without explicit consent.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Medical Disclaimer</h4>
                <p className="text-sm text-gray-600">
                  MindSharp is designed for cognitive enhancement and is not intended to diagnose, treat, or cure any
                  medical condition. Consult healthcare professionals for medical advice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research References */}
        <Card>
          <CardHeader>
            <CardTitle>Research References</CardTitle>
            <CardDescription>Scientific studies supporting our approach to cognitive training</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Cognitive Training and Neuroplasticity</p>
                <p className="text-gray-600">
                  Klingberg, T. (2010). Training and plasticity of working memory. Trends in Cognitive Sciences, 14(7),
                  317-324.
                </p>
              </div>
              <div>
                <p className="font-medium">Brain Training and Cognitive Reserve</p>
                <p className="text-gray-600">
                  Stern, Y. (2012). Cognitive reserve in ageing and Alzheimer's disease. The Lancet Neurology, 11(11),
                  1006-1012.
                </p>
              </div>
              <div>
                <p className="font-medium">Adaptive Cognitive Training</p>
                <p className="text-gray-600">
                  Au, J., et al. (2015). Improving fluid intelligence with training on working memory: a meta-analysis.
                  Psychonomic Bulletin & Review, 22(2), 366-377.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
