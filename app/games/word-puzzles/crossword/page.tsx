// app/games/word-puzzles/crossword/page.tsx
import { Metadata } from 'next'
import CrosswordGameClient from './crossword-game-client'

export const metadata: Metadata = {
  title: 'Crossword Puzzle | Mind Sharp',
  description: 'Challenge your vocabulary and word knowledge with our interactive crossword puzzles.',
}

export default function CrosswordPage() {
  return <CrosswordGameClient />
}
