"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Check,
  RotateCcw,
  Lightbulb,
  Trophy,
  QuestionCircle,
} from "lucide-react";
import Link from "next/link";
import { cognitiveAPI, type CrosswordPuzzle } from "@/lib/cognitive-api";

export default function CrosswordGame() {
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedClue, setSelectedClue] = useState<{ type: "across" | "down"; number: number } | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [difficulty, setDifficulty] = useState(2);
  const [theme, setTheme] = useState("general");
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [cellStatus, setCellStatus] = useState<Record<string, "correct" | "incorrect" | null>>({});
  const gridRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // Default puzzle
  const crosswordData: CrosswordPuzzle = {
    id: "crossword_1",
    grid: [
      ["1", "E", "L", "E", "P", "H", "A", "N", "T", ""],
      ["", "", "", "2", "", "", "", "", "3", ""],
      ["", "", "", "G", "", "", "", "", "R", ""],
      ["", "", "", "G", "", "", "", "", "E", ""],
      ["4", "A", "P", "P", "L", "E", "", "", "E", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["5", "B", "E", "E", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", ""],
    ],
    clues: {
      across: [
        { number: 1, clue: "Large gray mammal with trunk", answer: "ELEPHANT", startRow: 0, startCol: 1 },
        { number: 4, clue: "Red fruit that grows on trees", answer: "APPLE", startRow: 4, startCol: 1 },
        { number: 5, clue: "Flying insect that makes honey", answer: "BEE", startRow: 6, startCol: 1 },
      ],
      down: [
        { number: 2, clue: "Breakfast food from chickens", answer: "EGG", startRow: 1, startCol: 3 },
        { number: 3, clue: "Tall plant with leaves", answer: "TREE", startRow: 1, startCol: 8 },
      ],
    },
    difficulty: 2,
    theme: "general",
  };

  // Initialize grid refs
  useEffect(() => {
    gridRefs.current = puzzle?.grid.map((row) => row.map(() => null)) || [];
  }, [puzzle]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem("crosswordProgress");
    if (saved) {
      const { answers, time, score, hints } = JSON.parse(saved);
      setUserAnswers(answers || {});
      setTimeElapsed(time || 0);
      setScore(score || 0);
      setHintsUsed(hints || 0);
    }
  }, []);

  // Save progress
  useEffect(() => {
    if (gameStarted) {
      localStorage.setItem(
        "crosswordProgress",
        JSON.stringify({
          answers: userAnswers,
          time: timeElapsed,
          score,
          hints: hintsUsed,
        })
      );
    }
  }, [userAnswers, timeElapsed, score, hintsUsed, gameStarted]);

  const startGame = async () => {
    setLoading(true);
    try {
      const response = await cognitiveAPI.generateCrossword(theme, difficulty);
      if (response.success && response.data) {
        setPuzzle(response.data);
      } else {
        setPuzzle(crosswordData);
      }
      resetGameState();
    } catch (error) {
      setPuzzle(crosswordData);
      resetGameState();
    } finally {
      setLoading(false);
    }
  };

  const resetGameState = () => {
    setGameStarted(true);
    setTimeElapsed(0);
    setScore(0);
    setUserAnswers({});
    setGameCompleted(false);
    setSelectedCell(null);
    setSelectedClue(null);
    setHintsUsed(0);
    setCellStatus({});
    localStorage.removeItem("crosswordProgress");
  };

  const handleCellClick = (row: number, col: number) => {
    if (puzzle?.grid[row][col] === "") return;
    
    const newDirection = selectedCell?.row === row && selectedCell?.col === col ? (direction === "across" ? "down" : "across") : direction;
    setDirection(newDirection);
    setSelectedCell({ row, col });

    // Find corresponding clue
    const clue = findClueForCell(row, col, newDirection);
    if (clue) {
      setSelectedClue({ type: newDirection, number: clue.number });
    }
  };

  const findClueForCell = (row: number, col: number, dir: "across" | "down") => {
    if (!puzzle) return null;
    const clues = dir === "across" ? puzzle.clues.across : puzzle.clues.down;
    return clues.find((clue) => {
      if (dir === "across") {
        return (
          clue.startRow === row &&
          col >= clue.startCol &&
          col < clue.startCol + clue.answer.length
        );
      }
      return (
        clue.startCol === col &&
        row >= clue.startRow &&
        row < clue.startRow + clue.answer.length
      );
    });
  };

  const handleCellInput = (row: number, col: number, value: string) => {
    if (!puzzle || puzzle.grid[row][col] === "") return;
    
    const key = `${row}-${col}`;
    const newValue = value.toUpperCase().slice(-1);
    
    setUserAnswers((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    // Move to next cell
    if (newValue && selectedCell) {
      moveToNextCell(row, col);
    }
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
      if (!selectedCell || !puzzle) return;

      e.preventDefault();
      const { key } = e;

      if (key.match(/^[a-zA-Z]$/)) {
        handleCellInput(row, col, key);
      } else if (key === "Backspace") {
        const key = `${row}-${col}`;
        setUserAnswers((prev) => ({
          ...prev,
          [key]: "",
        }));
        moveToPreviousCell(row, col);
      } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
        handleNavigation(key, row, col);
      }
    },
    [selectedCell, puzzle, direction]
  );

  const moveToNextCell = (row: number, col: number) => {
    if (!puzzle) return;
    let nextRow = row;
    let nextCol = col;

    if (direction === "across") {
      nextCol++;
      while (
        nextCol < puzzle.grid[0].length &&
        puzzle.grid[nextRow][nextCol] === ""
      ) {
        nextCol++;
      }
    } else {
      nextRow++;
      while (
        nextRow < puzzle.grid.length &&
        puzzle.grid[nextRow][nextCol] === ""
      ) {
        nextRow++;
      }
    }

    if (
      nextRow < puzzle.grid.length &&
      nextCol < puzzle.grid[0].length &&
      puzzle.grid[nextRow][nextCol] !== ""
    ) {
      setSelectedCell({ row: nextRow, col: nextCol });
      gridRefs.current[nextRow][nextCol]?.focus();
    }
  };

  const moveToPreviousCell = (row: number, col: number) => {
    if (!puzzle) return;
    let prevRow = row;
    let prevCol = col;

    if (direction === "across") {
      prevCol--;
      while (prevCol >= 0 && puzzle.grid[prevRow][prevCol] === "") {
        prevCol--;
      }
    } else {
      prevRow--;
      while (prevRow >= 0 && puzzle.grid[prevRow][prevCol] === "") {
        prevRow--;
      }
    }

    if (prevRow >= 0 && prevCol >= 0 && puzzle.grid[prevRow][prevCol] !== "") {
      setSelectedCell({ row: prevRow, col: prevCol });
      gridRefs.current[prevRow][prevCol]?.focus();
    }
  };

  const handleNavigation = (key: string, row: number, col: number) => {
    if (!puzzle) return;
    let newRow = row;
    let newCol = col;

    switch (key) {
      case "ArrowUp":
        newRow--;
        while (newRow >= 0 && puzzle.grid[newRow][col] === "") {
          newRow--;
        }
        break;
      case "ArrowDown":
        newRow++;
        while (newRow < puzzle.grid.length && puzzle.grid[newRow][col] === "") {
          newRow++;
        }
        break;
      case "ArrowLeft":
        newCol--;
        while (newCol >= 0 && puzzle.grid[row][newCol] === "") {
          newCol--;
        }
        break;
      case "ArrowRight":
        newCol++;
        while (
          newCol < puzzle.grid[0].length &&
          puzzle.grid[row][newCol] === ""
        ) {
          newCol++;
        }
        break;
    }

    if (
      newRow >= 0 &&
      newRow < puzzle.grid.length &&
      newCol >= 0 &&
      newCol < puzzle.grid[0].length &&
      puzzle.grid[newRow][newCol] !== ""
    ) {
      setSelectedCell({ row: newRow, col: newCol });
      gridRefs.current[newRow][newCol]?.focus();
      const clue = findClueForCell(newRow, newCol, direction);
      if (clue) {
        setSelectedClue({ type: direction, number: clue.number });
      }
    }
  };

  const handleClueClick = (type: "across" | "down", number: number) => {
    setSelectedClue({ type, number });
    
    const clue = puzzle?.clues[type].find((c) => c.number === number);
    if (clue) {
      setSelectedCell({ row: clue.startRow, col: clue.startCol });
      setDirection(type);
      gridRefs.current[clue.startRow][clue.startCol]?.focus();
    }
  };

  const checkAnswers = () => {
    if (!puzzle) return;

    let correctAnswers = 0;
    let totalAnswers = 0;
    const newCellStatus: Record<string, "correct" | "incorrect" | null> = {};

    // Check across
    puzzle.clues.across.forEach((clue) => {
      let isCorrect = true;
      for (let i = 0; i < clue.answer.length; i++) {
        const key = `${clue.startRow}-${clue.startCol + i}`;
        const isCorrectCell = userAnswers[key] === clue.answer[i];
        newCellStatus[key] = isCorrectCell ? "correct" : "incorrect";
        if (!isCorrectCell) isCorrect = false;
      }
      if (isCorrect) correctAnswers++;
      totalAnswers++;
    });

    // Check down
    puzzle.clues.down.forEach((clue) => {
      let isCorrect = true;
      for (let i = 0; i < clue.answer.length; i++) {
        const key = `${clue.startRow + i}-${clue.startCol}`;
        const isCorrectCell = userAnswers[key] === clue.answer[i];
        newCellStatus[key] = isCorrectCell ? "correct" : "incorrect";
        if (!isCorrectCell) isCorrect = false;
      }
      if (isCorrect) correctAnswers++;
      totalAnswers++;
    });

    setCellStatus(newCellStatus);
    const newScore = Math.round((correctAnswers / totalAnswers) * 100);
    setScore(newScore);

    if (correctAnswers === totalAnswers) {
      setGameCompleted(true);
      cognitiveAPI.trackProgress({
        date: new Date().toISOString(),
        score: newScore,
        gameType: "crossword",
        difficulty,
        timeSpent: timeElapsed,
        cognitiveAreas: ["Language", "Memory", "Problem Solving"],
      });
    }
  };

  const getHint = () => {
    if (!puzzle || !selectedClue || hintsUsed >= 3) return;

    const clue = puzzle.clues[selectedClue.type].find(
      (c) => c.number === selectedClue.number
    );
    if (!clue) return;

    let emptyCellIndex = -1;
    if (selectedClue.type === "across") {
      for (let i = 0; i < clue.answer.length; i++) {
        const key = `${clue.startRow}-${clue.startCol + i}`;
        if (!userAnswers[key]) {
          emptyCellIndex = i;
          break;
        }
      }
    } else {
      for (let i = 0; i < clue.answer.length; i++) {
        const key = `${clue.startRow + i}-${clue.startCol}`;
        if (!userAnswers[key]) {
          emptyCellIndex = i;
          break;
        }
      }
    }

    if (emptyCellIndex !== -1) {
      const key =
        selectedClue.type === "across"
          ? `${clue.startRow}-${clue.startCol + emptyCellIndex}`
          : `${clue.startRow + emptyCellIndex}-${clue.startCol}`;
      setUserAnswers((prev) => ({
        ...prev,
        [key]: clue.answer[emptyCellIndex],
      }));
      setHintsUsed((prev) => prev + 1);
    }
  };

  const resetGame = () => {
    resetGameState();
    setPuzzle(crosswordData);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isCellHighlighted = (row: number, col: number) => {
    if (!puzzle || !selectedClue) return false;
    const clue = puzzle.clues[selectedClue.type].find(
      (c) => c.number === selectedClue.number
    );
    if (!clue) return false;

    if (selectedClue.type === "across") {
      return (
        row === clue.startRow &&
        col >= clue.startCol &&
        col < clue.startCol + clue.answer.length
      );
    }
    return (
      col === clue.startCol &&
      row >= clue.startRow &&
      row < clue.startRow + clue.answer.length
    );
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Crossword Puzzle</h1>
            <p className="text-gray-600">Challenge your vocabulary and general knowledge</p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select
                  value={difficulty.toString()}
                  onValueChange={(value) => setDifficulty(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Easy</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Theme</label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Knowledge</SelectItem>
                    <SelectItem value="animals">Animals</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={startGame}
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Generating Puzzle..." : "Start Game"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!puzzle) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 touch-manipulation">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <Button asChild variant="ghost" className="mb-2">
              <Link href="/games/word-puzzles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Word Puzzles
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Crossword Puzzle</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">Time: {formatTime(timeElapsed)}</Badge>
            <Badge variant="outline">Score: {score}%</Badge>
            <Badge>Difficulty: {difficulty}/3</Badge>
            <Badge>Hints: {3 - hintsUsed}/3</Badge>
          </div>
        </div>

        {gameCompleted && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Congratulations!
                  </h3>
                  <p className="text-green-700">
                    You completed the crossword in {formatTime(timeElapsed)} with a
                    score of {score}%!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Crossword Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Crossword Grid</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={checkAnswers} size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Check Answers
                  </Button>
                  <Button
                    onClick={getHint}
                    size="sm"
                    variant="outline"
                    disabled={hintsUsed >= 3 || !selectedClue}
                  >
                    <QuestionCircle className="h-4 w-4 mr-2" />
                    Hint ({3 - hintsUsed}/3)
                  </Button>
                  <Button onClick={resetGame} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={`grid grid-cols-${puzzle.grid[0].length} gap-1 max-w-full overflow-auto touch-action-pan-y`}
                  style={{ touchAction: "pan-y" }}
                >
                  {puzzle.grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const key = `${rowIndex}-${colIndex}`;
                      const isBlack = cell === "";
                      const isNumberCell = /^\d+$/.test(cell);
                      const cellNumber = isNumberCell ? cell : "";
                      const isSelected =
                        selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                      const isHighlighted = isCellHighlighted(rowIndex, colIndex);
                      const status = cellStatus[key];

                      return (
                        <div key={key} className="relative select-none">
                          {isBlack ? (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-sm" />
                          ) : (
                            <div className="relative">
                              <input
                                ref={(el) => (gridRefs.current[rowIndex][colIndex] = el)}
                                className={`w-7 h-7 sm:w-8 sm:h-8 text-center text-sm font-semibold p-0 border-2 rounded-sm
                                  ${isSelected ? "bg-blue-100 border-blue-400" : "border-gray-300"}
                                  ${isHighlighted ? "bg-yellow-50" : ""}
                                  ${status === "correct" ? "bg-green-50" : ""}
                                  ${status === "incorrect" ? "bg-red-50" : ""}
                                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-100`}
                                maxLength={1}
                                value={userAnswers[key] || ""}
                                onChange={(e) => handleCellInput(rowIndex, colIndex, e.target.value)}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                                aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1}`}
                                disabled={gameCompleted}
                              />
                              {cellNumber && (
                                <span className="absolute top-0 left-0 text-[8px] sm:text-xs font-bold text-blue-600 bg-white px-0.5 sm:px-1 leading-tight">
                                  {cellNumber}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clues */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Across</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0 sm:space-y-2">
                  {puzzle.clues.across.map((clue) => {
                    const isSelectedClue =
                      selectedClue?.type === "across" && selectedClue?.number === clue.number;
                    return (
                      <div
                        key={`across-${clue.number}`}
                        className={`p-2 sm:p-3 rounded-lg border transition-colors duration-200 cursor-pointer
                          ${isSelectedClue ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"}`}
                        onClick={() => handleClueClick("across", clue.number)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs shrink-0">
                              {clue.number}
                            </Badge>
                            <p className="text-sm">{clue.clue}</p>
                          </div>
                          <p className="text-xs text-gray-500 shrink-0">
                            ({clue.answer.length} letters)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Down</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0 sm:space-y-2">
                  {puzzle.clues.down.map((clue) => {
                    const isSelectedClue =
                      selectedClue?.type === "down" && selectedClue?.number === clue.number;
                    return (
                      <div
                        key={`down-${clue.number}`}
                        className={`p-2 sm:p-3 rounded-lg border transition-colors duration-200 cursor-pointer
                          ${isSelectedClue ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"}`}
                        onClick={() => handleClueClick("down", clue.number)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs shrink-0">
                              {clue.number}
                            </Badge>
                            <p className="text-sm">{clue.clue}</p>
                          </div>
                          <p className="text-xs text-gray-500 shrink-0">
                            ({clue.answer.length} letters)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Use arrow keys to move between cells</li>
                  <li>• Click a clue or cell to highlight it</li>
                  <li>• Double-click a cell to switch direction</li>
                  <li>• Use hints when stuck (3 max)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
