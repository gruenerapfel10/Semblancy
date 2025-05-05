import { type ChangelogEntry } from "@/components/ui/changelog";
import { getChangelogImage } from "./changelog-images";

// Directory where changelog images will be stored
export const CHANGELOG_IMAGES_DIR = "/images/changelog";

// Fallback placeholder image if a custom image is not found
export const DEFAULT_PLACEHOLDER = 'https://shadcnblocks.com/images/block/placeholder-aspect-video-1.svg';

export const changelogData: ChangelogEntry[] = [
  {
    version: "Version 1.9.0",
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    title: "Bi-Directional Flashcard Learning",
    description:
      "Introducing dynamic flashcard flipping! Cards now have a 50% chance to be presented with the answer as the question, helping you master content from both directions.",
    items: [
      "Random 50/50 chance for question/answer orientation",
      "Clear visual indicators when cards are flipped",
      "Maintains original context while testing bi-directional recall",
      "Enhanced learning through varied question formats",
      "Compatible with both flip-card and interactive study modes"
    ],
    get image() {
      return getChangelogImage(this.version);
    },
  },
  {
    version: "Version 1.8.0",
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    title: "Command Palette for Fast Navigation",
    description:
      "We've added a powerful command palette search bar that lets you quickly navigate to any page in the application with just a keyboard shortcut.",
    items: [
      "Press Cmd+K (Mac) or Ctrl+K (Windows) to open the search bar",
      "Easily navigate to any section without using the mouse",
      "Visual indicator in the navbar with keyboard shortcut hint",
      "Grouped search results by category for better organization",
      "Complete keyboard navigation support"
    ],
    get image() {
      return getChangelogImage(this.version);
    },
  },
  {
    version: "Version 1.7.0",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    title: "AI Assistant Panel Integration",
    description:
      "Introducing our new AI helper assistant panel that provides contextual assistance and language learning support with a simple keyboard shortcut.",
    items: [
      "Toggle the AI panel with Cmd+J (Mac) or Ctrl+J (Windows)",
      "Integrated brain icon in the navbar for easy access",
      "Contextual language learning assistance",
      "Real-time explanations and translations",
      "Enhanced learning experience with AI-powered feedback"
    ],
    get image() {
      return getChangelogImage(this.version);
    },
  },
  {
    version: "Version 1.6.0",
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    title: "Custom 404 Page Experience",
    description:
      "We've implemented a custom 404 error page that helps users navigate back to valid content when they encounter a missing page.",
    items: [
      "Friendly and helpful error messaging",
      "Suggestions for popular pages to visit instead",
      "Quick navigation back to the dashboard",
      "Improved user experience during navigation errors",
      "Clear visual design consistent with our brand"
    ],
    get image() {
      return getChangelogImage(this.version);
    },
  },
  {
    version: "Version 1.5.0",
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    title: "Complete Boilerplate Pages",
    description:
      "We've added boilerplate pages for all sections listed in the sidebar to ensure a consistent navigation experience without 404 errors.",
    items: [
      "All sidebar navigation links now lead to valid pages",
      "Placeholder content for upcoming features",
      "Consistent layout and design across all sections",
      "Improved navigation flow through the application",
      "Ready framework for future feature additions"
    ],
    get image() {
      return getChangelogImage(this.version);
    },
  },
  {
    version: "Version 1.4.5",
    date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    title: "Enhanced Sidebar Experience",
    description:
      "We've completely revamped the sidebar with improved styling, keyboard shortcuts, and a more intuitive navigation experience.",
    items: [
      "Toggle sidebar visibility with Cmd+E or Ctrl+E",
      "Refined visual design with improved spacing and typography",
      "Hover states that provide additional context",
      "Better organization of menu items by category",
      "Responsive design that adapts to different screen sizes"
    ],
    get image() {
      return getChangelogImage(this.version);
    },
  },
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