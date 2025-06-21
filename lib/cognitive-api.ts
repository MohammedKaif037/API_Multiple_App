// Types for the cognitive stimulation platform
export interface Game {
  id: string
  name: string
  category: "word-puzzles" | "card-games" | "board-games" | "brain-training" | "dice-games"
  difficulty: number
  description: string
  estimatedTime: number
  cognitiveAreas: string[]
}

export interface UserStats {
  userId: string
  gamesPlayed: number
  totalScore: number
  averageScore: number
  streakDays: number
  lastPlayed: Date
  categoryStats: Record<
    string,
    {
      gamesPlayed: number
      averageScore: number
      bestScore: number
      timeSpent: number
    }
  >
}

export interface ProgressData {
  date: string
  score: number
  gameType: string
  difficulty: number
  timeSpent: number
  cognitiveAreas: string[]
}

export interface CrosswordPuzzle {
  id: string
  grid: string[][]
  clues: {
    across: { number: number; clue: string; answer: string; startRow: number; startCol: number }[]
    down: { number: number; clue: string; answer: string; startRow: number; startCol: number }[]
  }
  difficulty: number
  theme?: string
}

export interface WordSearchPuzzle {
  id: string
  grid: string[][]
  words: string[]
  theme: string
  difficulty: number
}

export interface MemoryGame {
  id: string
  cards: { id: string; content: string; matched: boolean; flipped: boolean }[]
  difficulty: number
  theme: string
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PersonalizedRecommendation {
  gameType: string
  difficulty: number
  reason: string
  cognitiveAreas: string[]
  estimatedBenefit: number
}

export interface ProgressInsight {
  category: string
  trend: "improving" | "stable" | "declining"
  recommendation: string
  strengthAreas: string[]
  improvementAreas: string[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
  progress: number
  maxProgress: number
}

// Update the API integration to use OpenAI client pattern
import OpenAI from "openai"

// Main API service class
export class CognitiveAPI {
  private client: OpenAI

  constructor(apiKey: string, baseURL = "https://api.chatanywhere.tech/v1") {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
      dangerouslyAllowBrowser: true, // Allow browser usage
    })
  }

  // Generate crossword puzzle using OpenAI
  async generateCrossword(theme: string, difficulty: number): Promise<APIResponse<CrosswordPuzzle>> {
    try {
      const prompt = `Generate a ${difficulty === 1 ? "easy" : difficulty === 2 ? "medium" : "hard"} crossword puzzle with theme "${theme}". 
      Return a JSON object with:
      - grid: 10x10 array of letters (empty cells as "")
      - clues: {across: [{number, clue, answer, startRow, startCol}], down: [{number, clue, answer, startRow, startCol}]}
      - difficulty: ${difficulty}
      - theme: "${theme}"
      
      Include 8-12 words total. Make clues challenging but fair.`

      const response = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      })

      const content = response.choices[0]?.message?.content
      if (content) {
        try {
          const puzzleData = JSON.parse(content)
          const crossword: CrosswordPuzzle = {
            id: `crossword_${Date.now()}`,
            ...puzzleData,
          }
          return { success: true, data: crossword }
        } catch (parseError) {
          // Fallback to mock data if parsing fails
          return this.getMockCrossword(theme, difficulty)
        }
      }

      return this.getMockCrossword(theme, difficulty)
    } catch (error) {
      return this.getMockCrossword(theme, difficulty)
    }
  }

  private getMockCrossword(theme: string, difficulty: number): APIResponse<CrosswordPuzzle> {
    const mockCrossword: CrosswordPuzzle = {
      id: `crossword_${Date.now()}`,
      grid: Array(10)
        .fill(null)
        .map(() => Array(10).fill("")),
      clues: {
        across: [
          { number: 1, clue: "Large mammal", answer: "ELEPHANT", startRow: 0, startCol: 0 },
          { number: 3, clue: "Flying insect", answer: "BEE", startRow: 2, startCol: 1 },
        ],
        down: [
          { number: 1, clue: "Breakfast food", answer: "EGG", startRow: 0, startCol: 0 },
          { number: 2, clue: "Tree fruit", answer: "APPLE", startRow: 1, startCol: 4 },
        ],
      },
      difficulty,
      theme,
    }
    return { success: true, data: mockCrossword }
  }

  // Generate word search puzzle
  async generateWordSearch(theme: string, difficulty: number): Promise<APIResponse<WordSearchPuzzle>> {
    try {
      const mockWordSearch: WordSearchPuzzle = {
        id: `wordsearch_${Date.now()}`,
        grid: Array(12)
          .fill(null)
          .map(() =>
            Array(12)
              .fill("")
              .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))),
          ),
        words: ["BRAIN", "MEMORY", "FOCUS", "THINK", "LEARN"],
        theme,
        difficulty,
      }

      return { success: true, data: mockWordSearch }
    } catch (error) {
      return { success: false, error: "Failed to generate word search puzzle" }
    }
  }

  // Generate memory card game
  async generateMemoryGame(theme: string, difficulty: number): Promise<APIResponse<MemoryGame>> {
    try {
      const cardCount = difficulty === 1 ? 8 : difficulty === 2 ? 12 : 16
      const themes = {
        animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"],
        fruits: ["🍎", "🍌", "🍊", "🍇", "🍓", "🥝", "🍑", "🍒"],
        shapes: ["⭐", "🔵", "🔺", "🟢", "🟡", "🟣", "🔶", "🔷"],
      }

      const selectedTheme = themes[theme as keyof typeof themes] || themes.animals
      const cards = selectedTheme
        .slice(0, cardCount / 2)
        .flatMap((content, index) => [
          { id: `${index}_1`, content, matched: false, flipped: false },
          { id: `${index}_2`, content, matched: false, flipped: false },
        ])
        .sort(() => Math.random() - 0.5)

      const mockMemoryGame: MemoryGame = {
        id: `memory_${Date.now()}`,
        cards,
        difficulty,
        theme,
      }

      return { success: true, data: mockMemoryGame }
    } catch (error) {
      return { success: false, error: "Failed to generate memory game" }
    }
  }

  // Analyze user progress
  async analyzeProgress(userStats: UserStats): Promise<APIResponse<ProgressInsight[]>> {
    try {
      const insights: ProgressInsight[] = [
        {
          category: "Memory",
          trend: "improving",
          recommendation: "Continue with memory games to strengthen recall abilities",
          strengthAreas: ["Visual memory", "Pattern recognition"],
          improvementAreas: ["Sequential memory"],
        },
        {
          category: "Processing Speed",
          trend: "stable",
          recommendation: "Try more challenging timed exercises",
          strengthAreas: ["Quick decision making"],
          improvementAreas: ["Complex pattern processing"],
        },
      ]

      return { success: true, data: insights }
    } catch (error) {
      return { success: false, error: "Failed to analyze progress" }
    }
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(userId: string): Promise<APIResponse<PersonalizedRecommendation[]>> {
    try {
      const recommendations: PersonalizedRecommendation[] = [
        {
          gameType: "crossword",
          difficulty: 2,
          reason: "Based on your vocabulary strength, try medium difficulty crosswords",
          cognitiveAreas: ["Language", "Memory", "Problem Solving"],
          estimatedBenefit: 85,
        },
        {
          gameType: "memory-cards",
          difficulty: 3,
          reason: "Your visual memory is improving - challenge yourself with harder levels",
          cognitiveAreas: ["Visual Memory", "Attention", "Processing Speed"],
          estimatedBenefit: 78,
        },
      ]

      return { success: true, data: recommendations }
    } catch (error) {
      return { success: false, error: "Failed to get recommendations" }
    }
  }

  // Adjust difficulty based on performance
  async adjustDifficulty(
    gameType: string,
    currentDifficulty: number,
    recentScores: number[],
  ): Promise<APIResponse<number>> {
    try {
      const averageScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      let newDifficulty = currentDifficulty

      if (averageScore > 80 && currentDifficulty < 3) {
        newDifficulty = currentDifficulty + 1
      } else if (averageScore < 50 && currentDifficulty > 1) {
        newDifficulty = currentDifficulty - 1
      }

      return { success: true, data: newDifficulty }
    } catch (error) {
      return { success: false, error: "Failed to adjust difficulty" }
    }
  }

  // Get available games
  async getAvailableGames(): Promise<APIResponse<Game[]>> {
    try {
      const games: Game[] = [
        {
          id: "crossword",
          name: "Crossword Puzzles",
          category: "word-puzzles",
          difficulty: 2,
          description: "Challenge your vocabulary and general knowledge",
          estimatedTime: 15,
          cognitiveAreas: ["Language", "Memory", "Problem Solving"],
        },
        {
          id: "word-search",
          name: "Word Search",
          category: "word-puzzles",
          difficulty: 1,
          description: "Find hidden words in letter grids",
          estimatedTime: 10,
          cognitiveAreas: ["Visual Processing", "Attention", "Pattern Recognition"],
        },
        {
          id: "memory-cards",
          name: "Memory Cards",
          category: "card-games",
          difficulty: 2,
          description: "Match pairs of cards to improve memory",
          estimatedTime: 8,
          cognitiveAreas: ["Visual Memory", "Attention", "Processing Speed"],
        },
        {
          id: "chess",
          name: "Chess",
          category: "board-games",
          difficulty: 3,
          description: "Strategic thinking and planning",
          estimatedTime: 30,
          cognitiveAreas: ["Strategic Thinking", "Planning", "Problem Solving"],
        },
        {
          id: "pattern-recognition",
          name: "Pattern Recognition",
          category: "brain-training",
          difficulty: 2,
          description: "Identify and complete visual patterns",
          estimatedTime: 12,
          cognitiveAreas: ["Pattern Recognition", "Visual Processing", "Logic"],
        },
      ]

      return { success: true, data: games }
    } catch (error) {
      return { success: false, error: "Failed to get available games" }
    }
  }

  // Track user progress
  async trackProgress(progressData: ProgressData): Promise<APIResponse<boolean>> {
    try {
      // In a real implementation, this would save to a database
      console.log("Progress tracked:", progressData)
      return { success: true, data: true }
    } catch (error) {
      return { success: false, error: "Failed to track progress" }
    }
  }

  // Get user achievements
  async getUserAchievements(userId: string): Promise<APIResponse<Achievement[]>> {
    try {
      const achievements: Achievement[] = [
        {
          id: "first_game",
          name: "First Steps",
          description: "Complete your first cognitive game",
          icon: "🎯",
          unlockedAt: new Date(),
          progress: 1,
          maxProgress: 1,
        },
        {
          id: "streak_7",
          name: "Week Warrior",
          description: "Play games for 7 consecutive days",
          icon: "🔥",
          progress: 3,
          maxProgress: 7,
        },
        {
          id: "memory_master",
          name: "Memory Master",
          description: "Score 90% or higher on 10 memory games",
          icon: "🧠",
          progress: 6,
          maxProgress: 10,
        },
      ]

      return { success: true, data: achievements }
    } catch (error) {
      return { success: false, error: "Failed to get achievements" }
    }
  }

  // Get daily challenge
  async getDailyChallenge(): Promise<APIResponse<Game>> {
    try {
      const games = await this.getAvailableGames()
      if (games.success && games.data) {
        const randomGame = games.data[Math.floor(Math.random() * games.data.length)]
        return { success: true, data: randomGame }
      }
      throw new Error("No games available")
    } catch (error) {
      return { success: false, error: "Failed to get daily challenge" }
    }
  }
}

// Export a default instance (you can configure this with your actual API key)
export const cognitiveAPI = new CognitiveAPI(
  process.env.NEXT_PUBLIC_CHATANYWHERE_API_KEY || "demo-key",
  "https://api.chatanywhere.tech/v1",
)
