import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BoardGamesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Board Games</h1>
      <p className="mb-4">Welcome to the board games page! Choose a game to play:</p>

      <Button asChild className="mt-4 w-full">
        <Link href="/games/board-games/tic-tac-toe">Play Tic-Tac-Toe</Link>
      </Button>
    </div>
  )
}
