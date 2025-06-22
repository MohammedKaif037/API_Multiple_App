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
// Fixed cognitive-api.ts - Focus on the crossword generation part

export class CognitiveAPI {
  private client: OpenAI

  constructor(apiKey: string, baseURL = "https://api.chatanywhere.tech/v1") {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
      dangerouslyAllowBrowser: true,
    })
  }

  // Improved helper function to build crossword grid
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
      console.log(`🔍 Trying to place "${answer}" (${direction}) at (${row},${col})`)
      
      // Check if word fits in grid
      const endRow = direction === "across" ? row : row + answer.length - 1
      const endCol = direction === "across" ? col + answer.length - 1 : col

      if (endRow >= 10 || endCol >= 10 || row < 0 || col < 0) {
        console.error(`❌ Word "${answer}" doesn't fit: would end at (${endRow},${endCol})`)
        return false
      }

      // Check for conflicts with existing letters
      for (let i = 0; i < answer.length; i++) {
        const r = direction === "across" ? row : row + i
        const c = direction === "across" ? col + i : col
        const currentCell = grid[r][c]
        const newLetter = answer[i]

        // Skip empty cells and number markers
        if (currentCell === "" || /^\d+$/.test(currentCell)) {
          continue
        }
        
        // Check for letter conflicts
        if (currentCell !== newLetter) {
          console.error(`❌ Letter conflict at (${r},${c}): existing="${currentCell}" vs new="${newLetter}"`)
          return false
        }
      }

      // Place the word
      console.log(`✅ Placing "${answer}" successfully`)
      for (let i = 0; i < answer.length; i++) {
        const r = direction === "across" ? row : row + i
        const c = direction === "across" ? col + i : col

        // Place number marker only at the start if cell is empty
        if (i === 0 && grid[r][c] === "") {
          grid[r][c] = number.toString()
        } else if (grid[r][c] === "" || /^\d+$/.test(grid[r][c])) {
          // Replace empty cell or number with letter
          grid[r][c] = answer[i]
        }
        // If cell already has the same letter, leave it as is
      }
      return true
    }

    // Place across words first
    let placementSuccess = true
    for (const clue of clues.across) {
      if (!placeWord(clue.answer, clue.startRow, clue.startCol, "across", clue.number)) {
        console.error(`❌ Failed to place across word: "${clue.answer}"`)
        placementSuccess = false
      }
    }

    // Place down words
    for (const clue of clues.down) {
      if (!placeWord(clue.answer, clue.startRow, clue.startCol, "down", clue.number)) {
        console.error(`❌ Failed to place down word: "${clue.answer}"`)
        placementSuccess = false
      }
    }

    if (!placementSuccess) {
      console.log("⚠️ Some words couldn't be placed, using mock data")
      return this.getMockGrid()
    }

    console.log("🎯 Final grid built successfully:", grid)
    return grid
  }

  private getMockGrid(): string[][] {
    return [
      ["1", "S", "2", "C", "I", "", "", "", "", ""],
      ["", "", "T", "", "", "", "", "", "", ""],
      ["", "", "A", "", "", "", "", "", "", ""],
      ["3", "L", "A", "B", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
    ]
  }

  // Improved crossword generation with better prompting
  async generateCrossword(theme: string, difficulty: number): Promise<APIResponse<CrosswordPuzzle>> {
    try {
      console.log("🎯 Generating crossword with:", { theme, difficulty })

      const wordCount = difficulty === 1 ? "4-5" : difficulty === 2 ? "6-7" : "8-9"
      const maxLength = difficulty === 1 ? 6 : difficulty === 2 ? 8 : 10

      const prompt = `Create a crossword puzzle for theme "${theme}" with ${difficulty === 1 ? "easy" : difficulty === 2 ? "medium" : "hard"} difficulty.

REQUIREMENTS:
- Include ${wordCount} words total
- Each word should be ${difficulty === 1 ? "3-6" : difficulty === 2 ? "4-8" : "5-10"} letters long
- Grid size is 10x10 (positions 0-9)
- Words must fit completely within the grid
- At least 2 words should intersect (share a common letter)

Return ONLY a JSON object with this exact structure:
{
  "clues": {
    "across": [
      {"number": 1, "clue": "clue text", "answer": "ANSWER", "startRow": 0, "startCol": 0}
    ],
    "down": [
      {"number": 2, "clue": "clue text", "answer": "ANSWER", "startRow": 0, "startCol": 0}
    ]
  },
  "difficulty": ${difficulty},
  "theme": "${theme}"
}

VALIDATION RULES:
- All answers must be uppercase
- startRow + word length ≤ 10 for down words
- startCol + word length ≤ 10 for across words
- Intersecting words must have matching letters at intersection points
- Number clues sequentially starting from 1

Theme: ${theme}`

      console.log("📤 Sending improved prompt to API...")

      const response = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5, // Lower temperature for more consistent results
        max_tokens: 1000,
      })

      console.log("📥 API Response received")
      const content = response.choices[0]?.message?.content

      if (content) {
        try {
          console.log("📝 Raw content:", content)
          
          // Clean up the response (remove any markdown formatting)
          const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
          console.log("🧹 Cleaned content:", cleanContent)
          
          const puzzleData = JSON.parse(cleanContent)
          console.log("✅ Parsed puzzle data:", puzzleData)

          // Validate the puzzle structure
          if (!puzzleData.clues || !puzzleData.clues.across || !puzzleData.clues.down) {
            throw new Error("Invalid puzzle structure")
          }

          // Validate word placement bounds
          const isValidPlacement = (words: any[], direction: "across" | "down") => {
            return words.every(word => {
              const maxRow = direction === "across" ? 9 : 9 - word.answer.length + 1
              const maxCol = direction === "across" ? 9 - word.answer.length + 1 : 9
              return word.startRow >= 0 && word.startRow <= maxRow && 
                     word.startCol >= 0 && word.startCol <= maxCol
            })
          }

          if (!isValidPlacement(puzzleData.clues.across, "across") || 
              !isValidPlacement(puzzleData.clues.down, "down")) {
            console.error("❌ Invalid word placement detected, using mock data")
            return this.getMockCrossword(theme, difficulty)
          }

          // Build the grid
          const grid = this.buildCrosswordGrid(puzzleData.clues)

          const crossword: CrosswordPuzzle = {
            id: `crossword_${Date.now()}`,
            grid,
            clues: puzzleData.clues,
            difficulty: puzzleData.difficulty,
            theme: puzzleData.theme,
          }

          console.log("🎮 Final crossword generated successfully:", crossword)
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

    const mockClues = {
      across: [
        { number: 1, clue: `${theme} related word`, answer: "STAR", startRow: 1, startCol: 0 },
        { number: 3, clue: `Another ${theme} term`, answer: "LAB", startRow: 3, startCol: 1 },
      ],
      down: [
        { number: 2, clue: `${theme} concept`, answer: "ATOM", startRow: 0, startCol: 2 },
      ],
    }

    const mockCrossword: CrosswordPuzzle = {
      id: `crossword_${Date.now()}`,
      grid: this.buildCrosswordGrid(mockClues),
      clues: mockClues,
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
