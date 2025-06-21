import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BrainTrainingPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Brain Training Games</h1>
      <p className="mb-4">Challenge your mind with these fun and engaging brain training games.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pattern Recognition */}
        <div className="p-4 border rounded-md">
          <h2 className="text-lg font-semibold mb-2">Pattern Recognition</h2>
          <p className="text-sm text-gray-600 mb-2">
            Identify and complete patterns to improve your logical reasoning.
          </p>
          <Button asChild className="mt-4 w-full">
            <Link href="/games/brain-training/pattern-recognition">Play Pattern Recognition</Link>
          </Button>
        </div>

        {/* Add more game categories here */}
      </div>
    </div>
  )
}
