// context/SearchContext.jsx
"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";

const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    description: "Main dashboard overview",
    keywords: ["home", "main", "start", "overview"],
  },
  {
    path: "/dashboard/changelog",
    name: "Changelog",
    description: "Recent updates and changes",
    keywords: ["updates", "changes", "new", "version", "history"],
  },
  {
    path: "/dashboard/competition",
    name: "Competition",
    description: "Competitive activities and events",
    keywords: ["compete", "tournaments", "contests", "challenges"],
  },
  {
    path: "/dashboard/contact",
    name: "Contact",
    description: "Contact information and support",
    keywords: ["help", "support", "email", "message", "reach out"],
  },
  {
    path: "/dashboard/exam-centre-finder",
    name: "Exam Centre Finder",
    description: "Find your nearest exam center",
    keywords: ["locate", "test center", "testing", "examination location"],
  },
  {
    path: "/dashboard/flashcards",
    name: "Flashcards",
    description: "Study with digital flashcards",
    keywords: ["cards", "study", "memorize", "practice"],
  },
  {
    path: "/dashboard/forums",
    name: "Forums",
    description: "Discuss topics with other students",
    keywords: ["discuss", "community", "conversations", "posts", "threads"],
  },
  {
    path: "/dashboard/how-it-works",
    name: "How It Works",
    description: "Learn how to use the platform",
    keywords: ["guide", "tutorial", "instructions", "help", "manual"],
  },
  {
    path: "/dashboard/mocks",
    name: "Mocks",
    description: "Practice with mock exams",
    keywords: ["practice tests", "sample exams", "trial", "simulation"],
  },
  {
    path: "/dashboard/notes",
    name: "Notes",
    description: "Access your study notes",
    keywords: ["notes", "study", "annotations", "summaries"],
  },
  {
    path: "/dashboard/overview",
    name: "Overview",
    description: "Your personal overview",
    keywords: ["profile", "summary", "stats", "dashboard", "progress"],
  },
  {
    path: "/dashboard/past-papers",
    name: "Past Papers",
    description: "Browse previous exam papers",
    keywords: [
      "pastpapers",
      "previous exams",
      "old tests",
      "exam archives",
      "practice papers",
      "historical exams",
    ],
  },
  {
    path: "/dashboard/projectview",
    name: "Project View",
    description: "View and manage your projects",
    keywords: ["projects", "assignments", "tasks", "work"],
  },
  {
    path: "/dashboard/settings",
    name: "Settings",
    description: "Adjust your account settings",
    keywords: ["preferences", "options", "config", "account", "profile"],
  },
  {
    path: "/dashboard/skills",
    name: "Skills",
    description: "Track and develop your skills",
    keywords: [
      "abilities",
      "competencies",
      "learning",
      "progress",
      "development",
    ],
  },
  {
    path: "/dashboard/specifications",
    name: "Specifications",
    description: "Exam board specifications",
    keywords: ["specs", "requirements", "syllabus", "curriculum", "standards"],
  },
];

// Create context
const SearchContext = createContext(undefined);

export function SearchProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Enhanced semantic search with keywords
  const filteredRoutes = useMemo(() => {
    if (query.trim() === "") {
      return routes;
    }

    const normalizedQuery = query.toLowerCase().trim();

    return routes.filter((route) => {
      // Check name and description
      if (
        route.name.toLowerCase().includes(normalizedQuery) ||
        route.description.toLowerCase().includes(normalizedQuery)
      ) {
        return true;
      }

      // Check for semantic matches using keywords
      if (route.keywords && Array.isArray(route.keywords)) {
        // Check if any keyword includes the query
        return route.keywords.some(
          (keyword) =>
            keyword.toLowerCase().includes(normalizedQuery) ||
            normalizedQuery.includes(keyword.toLowerCase())
        );
      }

      // Check for compound words and word boundaries
      const routeNameWords = route.name.toLowerCase().split(/\s+/);
      const queryWords = normalizedQuery.split(/\s+/);

      // Check if query matches the start of compound words (like "pastpapers" matching "Past Papers")
      const compoundName = routeNameWords.join("");
      if (compoundName.includes(normalizedQuery)) {
        return true;
      }

      // Check if any query word is contained in the route name without spaces
      return queryWords.some((word) => compoundName.includes(word));
    });
  }, [query]);

  // Reset selectedIndex when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredRoutes.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle search with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleSearch();
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredRoutes.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredRoutes[selectedIndex]) {
            navigateTo(filteredRoutes[selectedIndex].path);
          }
          break;
        case "Escape":
          e.preventDefault();
          closeSearch();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, filteredRoutes, selectedIndex]);

  const openSearch = () => {
    setIsOpen(true);
    setQuery("");
  };

  const closeSearch = () => {
    setIsOpen(false);
    setQuery("");
  };

  const toggleSearch = () => {
    if (!isOpen) {
      openSearch();
    } else {
      closeSearch();
    }
  };

  const navigateTo = (path) => {
    console.log(`Navigating to: ${path}`);
    closeSearch();
    window.location.href = path;
  };

  const value = {
    isOpen,
    query,
    selectedIndex,
    filteredRoutes,
    openSearch,
    closeSearch,
    toggleSearch,
    setQuery,
    navigateTo,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

// Custom hook for using the search context
export function useSearch() {
  const context = useContext(SearchContext);

  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }

  return context;
}
