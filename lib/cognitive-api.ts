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

  // Helper function to build crossword grid from clues
  private buildCrosswordGrid(clues: CrosswordPuzzle["clues"]): string[][] {
    console.log("🔧 Building crossword grid from clues:", clues)

    // Initialize 10x10 grid with empty strings
    const grid: string[][] = Array(10)
      .fill(null)
      .map(() => Array(10).fill(""))

    const placeWord = (
      answer: string,
      row: number,
      col: number,
      direction: "across" | "down",
      number: number
    ): boolean => {
      // Validate placement before modifying grid
      for (let i = 0; i < answer.length; i++) {
        const r = direction === "across" ? row : row + i
        const c = direction === "across" ? col + i : col

        if (r >= 10 || c >= 10) {
          console.error(`Invalid placement for ${answer} at (${row},${col}) ${direction}: Out of bounds`)
          return false
        }

        const current = grid[r][c]
        if (current === "") {
          continue
        } else if (/^\d+$/.test(current)) {
          continue
        } else if (current !== answer[i]) {
          console.error(`Conflict at (${r},${c}): grid='${current}' vs word='${answer[i]}'`)
          return false
        }
      }

      // Place the word if validation passes
      for (let i = 0; i < answer.length; i++) {
        const r = direction === "across" ? row : row + i
        const c = direction === "across" ? col + i : col

        if (i === 0 && grid[r][c] === "") {
          grid[r][c] = number.toString()
        } else {
          grid[r][c] = answer[i]
        }
      }
      return true
    }

    // Place across clues
    for (const clue of clues.across) {
      console.log(`📝 Placing ACROSS word "${clue.answer}" at row ${clue.startRow}, col ${clue.startCol}`)
      if (!placeWord(clue.answer, clue.startRow, clue.startCol, "across", clue.number)) {
        console.error(`Failed to place across clue ${clue.number}: ${clue.answer}`)
        return grid
      }
    }

    // Place down clues
    for (const clue of clues.down) {
      console.log(`📝 Placing DOWN word "${clue.answer}" at row ${clue.startRow}, col ${clue.startCol}`)
      if (!placeWord(clue.answer, clue.startRow, clue.startCol, "down", clue.number)) {
        console.error(`Failed to place down clue ${clue.number}: ${clue.answer}`)
        return grid
      }
    }

    console.log("🎯 Final built grid:", grid)
    return grid
  }

  // Generate crossword puzzle using OpenAI
  async generateCrossword(theme: string, difficulty: number): Promise<APIResponse<CrosswordPuzzle>> {
    try {
      console.log("🎯 Generating crossword with:", { theme, difficulty })

      const prompt = `Generate a ${difficulty === 1 ? "easy" : difficulty === 2 ? "medium" : "hard"} crossword puzzle with theme "${theme}". 
      Return a JSON object with:
      - clues: {across: [{number, clue, answer, startRow, startCol}], down: [{number, clue, answer, startRow, startCol}]}
      - difficulty: ${difficulty}
      - theme: "${theme}"
      
      Make sure:
      - Include 5-8 words total for easy difficulty
      - Answers should be uppercase
      - startRow and startCol should be valid positions (0-9)
      - Words should fit within a 10x10 grid
      - Make clues challenging but fair
      - Ensure overlapping letters match exactly at intersections
      
      Do NOT include a grid array - I will build it from the clues.`

      console.log("📤 Sending prompt to ChatAnywhere API:", prompt)

      const response = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      })

      console.log("📥 Raw API response:", response)
      console.log("📝 Response content:", response.choices[0]?.message?.content)

      const content = response.choices[0]?.message?.content
      if (content) {
        try {
          console.log("🔄 Attempting to parse JSON content...")
          const puzzleData = JSON.parse(content)
          console.log("✅ Parsed puzzle data:", puzzleData)

          // Build the grid from the clues
          const grid = this.buildCrosswordGrid(puzzleData.clues)

          // Validate puzzle for overlapping letters
          const hasConflicts = grid.some((row, r) =>
            row.some((cell, c) => {
              let expectedLetters: string[] = []
              for (const direction of ["across", "down"] as const) {
                puzzleData.clues[direction].forEach((clue: any) => {
                  if (direction === "across") {
                    if (r === clue.startRow && c >= clue.startCol && c < clue.startCol + clue.answer.length) {
                      expectedLetters.push(clue.answer[c - clue.startCol])
                    }
                  } else {
                    if (c === clue.startCol && r >= clue.startRow && r < clue.startRow + clue.answer.length) {
                      expectedLetters.push(clue.answer[r - clue.startRow])
                    }
                  }
                })
              }
              return expectedLetters.length > 1 && !expectedLetters.every((letter) => letter === expectedLetters[0])
            })
          )

          if (hasConflicts) {
            console.error("Invalid puzzle: Overlapping letters do not match.")
            return this.getMockCrossword(theme, difficulty)
          }

          const crossword: CrosswordPuzzle = {
            id: `crossword_${Date.now()}`,
            grid,
            clues: puzzleData.clues,
            difficulty: puzzleData.difficulty,
            theme: puzzleData.theme,
          }
          console.log("🎮 Final crossword object:", crossword)
          return { success: true, data: crossword }
        } catch (parseError) {
          console.error("❌ JSON parsing failed:", parseError)
          console.log("🔄 Falling back to mock data")
          return this.getMockCrossword(theme, difficulty)
        }
      }

      console.log("⚠️ No content in response, using mock data")
      return this.getMockCrossword(theme, difficulty)
    } catch (error) {
      console.error("💥 API call failed:", error)
      console.log("🔄 Using mock data due to error")
      return this.getMockCrossword(theme, difficulty)
    }
  }

  private getMockCrossword(theme: string, difficulty: number): APIResponse<CrosswordPuzzle> {
    console.log("🎲 Generating mock crossword with:", { theme, difficulty })

    const mockCrossword: CrosswordPuzzle = {
      id: `crossword_${Date.now()}`,
      grid: [
        ["1", "L", "2", "O", "", "", "", "", "", ""],
        ["", "", "W", "", "", "", "", "", "", ""],
        ["", "", "L", "", "", "", "", "", "", ""],
        ["3", "C", "A", "T", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
      ],
      clues: {
        across: [
          { number: 1, clue: "Wild cat with a mane", answer: "LION", startRow: 0, startCol: 1 },
          { number: 3, clue: "Feline pet", answer: "CAT", startRow: 3, startCol: 1 },
        ],
        down: [
          { number: 2, clue: "Night bird", answer: "OWL", startRow: 0, startCol: 2 },
        ],
      },
      difficulty,
      theme,
    }

    console.log("🎲 Mock crossword generated:", mockCrossword)
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

// Export a default instance
export const cognitiveAPI = new CognitiveAPI(
  process.env.NEXT_PUBLIC_CHATANYWHERE_API_KEY || "demo-key",
  "https://api.chatanywhere.tech/v1",
)
