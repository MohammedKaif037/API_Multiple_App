import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DiceGamesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dice Games</h1>
      <p className="mb-4">Explore our collection of exciting dice games!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Yahtzee */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Yahtzee</h2>
          <p className="text-sm text-gray-500">
            Roll the dice and aim for the best combinations in this classic dice game.
          </p>
          <Button asChild className="mt-4 w-full">
            <Link href="/games/dice-games/yahtzee">Play Yahtzee</Link>
          </Button>
        </div>

        {/* Add more dice games here */}
      </div>
    </div>
  )
}
