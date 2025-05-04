import { type ChangelogEntry } from "@/components/ui/changelog";
import { getChangelogImage } from "./changelog-images";

// Directory where changelog images will be stored
export const CHANGELOG_IMAGES_DIR = "/images/changelog";

// Fallback placeholder image if a custom image is not found
export const DEFAULT_PLACEHOLDER = 'https://shadcnblocks.com/images/block/placeholder-aspect-video-1.svg';

export const changelogData: ChangelogEntry[] = [
  {
    version: "Version 1.4.0",
    date: "18 June 2023",
    title: "Simplified Learning Algorithm",
    description:
      "We've revamped our flashcard algorithm with a simplified approach that ensures all cards are seen at least once before any card repeats.",
    items: [
      "Randomized card selection with equal distribution",
      "Guaranteed exposure to all flashcards in each learning cycle",
      "Improved performance for large flashcard collections",
      "Simplified interface that maintains the same user experience",
      "Better progress tracking for each study cycle"
    ],
    get image() {
      return getChangelogImage(this.version);
    },
  },
  {
    version: "Version 1.3.0",
    date: "15 May 2023",
    title: "Mass Selection & Improved Algorithm",
    description:
      "We've upgraded the flashcard system with bulk selection capabilities and an enhanced spaced repetition algorithm for even more effective learning.",
    items: [
      "Select and delete multiple flashcards at once",
      "Improved card selection algorithm based on your performance",
      "Enhanced UI with better visual feedback",
      "Performance optimizations for larger flashcard sets",
      "Added a search bar to the flashcard sidebar"
    ],
    get image() {
      return getChangelogImage(this.version);
    },
  },
  {
    version: "Version 1.2.0",
    date: "10 March 2023",
    title: "Spaced Repetition & Retention Scores",
    description:
      "Introducing an advanced learning algorithm based on Ebbinghaus' forgetting curve that helps you remember more with less study time.",
    items: [
      "Retention score tracking for each flashcard",
      "Smart scheduling based on the forgetting curve",
      "Difficulty ratings that adapt to your performance",
      "Detailed memory retention analytics"
    ],
    get image() {
      return getChangelogImage(this.version);
    },
  },
  {
    version: "Version 1.1.0",
    date: "1 February 2023",
    title: "Interactive Flashcards",
    description:
      "We're excited to launch our interactive flashcard system! Create, study, and master any subject with our powerful new learning tool.",
    items: [
      "Create custom flashcards with rich text formatting",
      "Intuitive flip animation for natural study experience",
      "Organize cards into custom decks and categories",
      "Track your study progress with comprehensive statistics"
    ],
    get image() {
      return getChangelogImage(this.version);
    },
  }
]; 